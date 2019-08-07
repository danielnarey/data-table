const fs = require('fs-extra');
const got = require('got');
const neatCsv = require('neat-csv');
const stats = require('simple-statistics');
const checkSync = require('./type-check-sync');
const { typeCheck, types, extensions } = require('./type-errors');
const { fromArray } = require('./data-import');
const { toArray } = require('./data-export');


//---FUNCTION APPLICATION (WITH IMPLICIT PROMISE CHAINING)---//

// EXPOSED 
// dataTable, function<dataTable, [**] => *>, [**] => * 
const apply = async (dt, f, ...args) => {
  const _dt = await typeCheck(1, dt, types.dataTable);
  const _f = await typeCheck(2, f, types.function);
  
  return _f(...[].concat(_dt, args));
};


// EXPOSED 
// dataTable, dataTable, function<dataTable, dataTable, [**] => *>, [**] => *
const apply2 = async (dt1, dt2, f, ...args) => {
  const _dt1 = await typeCheck(1, dt1, types.dataTable);
  const _dt2 = await typeCheck(2, dt2, types.dataTable);
  const _f = await typeCheck(3, f, types.function);
  
  return _f(...[].concat(_dt1, _dt2, args));
};


//---HIGHER ORDER FUNCTIONS---//

// EXPOSED
// dataTable, array<function> => *
const pipe = async (dt, fArray) => {
  const _dt = await typeCheck(1, dt, types.dataTable);
  const _fArray = await typeCheck(2, fArray, types.functionArray);

  const iterator = (lastResult, i) => {
    if (i >= _fArray.length) {
      return lastResult;
    }
    
    return iterator(_fArray[i](lastResult), i + 1);
  }

  return iterator(_dt, 0);
};


// EXPOSED 
// dataTable, function<array => *> => object
const map = async (dt, f) => {
  const _dt = await typeCheck(1, dt, types.dataTable);
  const _f = await typeCheck(2, f, types.function);
  const r = (a, k) => Object.assign({}, a, { [k]: _f(_dt[k]) });

  return Object.keys(_dt).reduce(r, {});
};


// EXPOSED 
// dataTable, function<array => *> => object
const map2 = async (dt1, dt2, f) => {
  const _dt1 = await typeCheck(1, dt1, types.dataTable);
  const _dt2 = await typeCheck(2, dt2, types.dataTable);
  const _f = await typeCheck(3, f, types.function);
  const varNames = Object.keys(_dt1).filter(x => Object.keys(_dt2).includes(x));

  const r = (a, k) => Object.assign({}, a, { [k]: _f(_dt1[k], _dt2[k]) });

  return varNames.reduce(r, {});
};


// EXPOSED
// dataTable, function<*, array, string => *>, * => *   
const reduce = async (dt, r, initial) => {
  const _dt = await typeCheck(1, dt, types.dataTable);
  const _r = await typeCheck(2, r, types.function);
  const _initial = await initial;
  const varNames = Object.keys(_dt);

  const iterator = (accumulator, i) => {
    if (i >= varNames.length) {
      return accumulator;
    }
    
    return iterator(_r(accumulator, _dt[varNames[i]], varNames[i]), i + 1);
  }

  return iterator(initial, 0);
};


//---GETTING TABLE SIZE, VARIABLE NAMES, AND VALUES---//

// EXPOSED
// dataTable => object:{variables$number:int, observations$number:int}
const size = async (dt) => {
  const varNames = await variables(dt);
  const firstArray = await values(dt, varNames[0]);

  return {
    variables: varNames.length,
    observations: firstArray.length,
  };
};


// EXPOSED
// dataTable => array<string>
const variables = dt => apply(dt, Object.keys);


// EXPOSED
// dataTable, number:int => object
const observation = async (dt, n) => {
  const _n = await typeCheck(2, n, types.number, extensions.int);

  return map(dt, x => x[_n]);
}


// EXPOSED
// dataTable, string => array
const values = async (dt, varName) => {
  const _varName = await typeCheck(2, varName, types.string);

  return apply(dt, x => x[_varName]);
};


// EXPOSED
// dataTable, string => array
const unique = async (dt, varName) => {
  const valueArray = await values(dt, varName);
  
  return [...new Set(valueArray)];
};


// EXPOSED
// dataTable => object
const describe = async (dt) => {

};


//---SUBSETTING AND COMBINING VARIABLE SETS---//

// EXPOSED
// dataTable, array<string> => dataTable
const select = async (dt, varNames) => {
  const _dt = await typeCheck(1, dt, types.dataTable);
  const _varNames = await typeCheck(2, varNames, types.stringArray);
  const r = (a, k) => Object.assign({}, a, { [k]: _dt[k] });
  
  return _varNames.reduce(r, {});
};


// EXPOSED
// dataTable, array<string> => dataTable
const drop = async (dt, varNames) => {
  const _dt = await typeCheck(1, dt, types.dataTable);
  const _varNames = await typeCheck(2, varNames, types.stringArray);
  const keep = Object.keys(_dt).filter(v => !_varNames.includes(v));
  const r = (a, k) => Object.assign({}, a, { [k]: _dt[k] });
  
  return keep.reduce(r, {});
};


// EXPOSED
// dataTable, function<array => boolean> => dataTable
const include = async (dt, test) => {
  const _dt = await typeCheck(1, dt, types.dataTable);
  const _test = await typeCheck(2, test, types.function);
  const keep = Object.keys(_dt).filter(v => _test(_dt[v]));

  return select(_dt, keep);
};


// EXPOSED
// dataTable, dataTable => dataTable
const assign = async (dt1, dt2) => {
  const f = (a, b) => Object.assign({}, a, b);
  const result = await apply2(dt1, dt2, f);
  
  if (!(checkSync.isDataTable(result))) {
    throw new Error('Assign failed because the two data tables do not have the same number of observations (i.e., arrays are not all of the same length).');
  }
  
  return result;
};


// EXPOSED
// array<dataTable>, [array<string>], [string] => dataTable
const concat = async (dtArray, tableNames = [], separator = '$') => {
  const _dtArray = await typeCheck(1, dtArray, types.dataTableArray);
  const _tableNames = await typeCheck(2, tableNames, types.stringArray);
  const _separator = await typeCheck(3, separator, types.string);
  
  const r1 = (dt, i) => (a, k) => {
    const prefix = (i < _tableNames.length) ? _tableNames[i] : `table${i}`;
    return Object.assign({}, a, { [`${prefix}${_separator}${k}`]: dt[k] });
  };
  
  const r2 = (a, k, i) => {
    const prefixed = Object.keys(k).reduce(r1(k, i), {});
    return Object.assign({}, a, prefixed);
  };
  
  const result = await Promise.all(_dtArray).then(arr => arr.reduce(r2, {}));
  
  if (!(checkSync.isDataTable(result))) {
    throw new Error('Concat failed because the data tables do not have the same number of observations (i.e., arrays are not all of the same length).');
  }
  
  return result;
};


//---SUBSETTING AND COMBINING OBSERVATION SETS---//

// EXPOSED
// dataTable, number:leftBoundedInt(1) => dataTable
const head = async (dt, n = 5) => {
  const _n = await typeCheck(2, n, types.number, extensions.leftBoundedInt(1));

  return map(dt, x => x.slice(0, _n));
};


// EXPOSED
// dataTable, number:leftBoundedInt(1) => dataTable
const sample = async (dt, n) => {
  const _n = await typeCheck(2, n, types.number, extensions.leftBoundedInt(1));
  const varNames = await variables(dt);
  const firstArray = await values(dt, varNames[0]);
  const selected = stats.sample([...firstArray.keys()], _n);

  return map(dt, x => x.filter((c, i) => selected.includes(i)));
};


// EXPOSED
// dataTable, function<object => boolean> => dataTable
const filter = async (dt, test) => {
  const _test = await typeCheck(2, test, types.function);
  const obs = await toArray(dt);
  
  return fromArray(obs.filter(_test));
};


// EXPOSED
// dataTable, dataTable => dataTable
const append = async (dt1, dt2) => map2(dt1, dt2, Array.prototype.concat);


//---REORDERING AND TRANSFORMING TABLES---//

// dataTable, function<object => number> => dataTable
const arrange = async (dt, compare) => {
  const _compare = await typeCheck(2, test, types.function);
  const obs = await toArray(dt);
  
  return fromArray(obs.sort(_compare));
};


// dataTable, string, function<* => object> => dataTable
const cut = async (dt, varName, cutter) => {
  const _varName = typeCheck(2, varName, types.string);
  const _cutter = typeCheck(3, cutter, types.function);
  const oldValues = await values(dt, _varName);
  const newVars = fromArray(oldValues.map(_cutter));
  
  return assign(dt, newVars);
};


// dataTable, stringArray, function<object => *> => dataTable
const splice = async (dt, varNames, splicer, newName) => {
  const _varNames = await typeCheck(2, varName, types.stringArray);
  const _splicer = await typeCheck(3, splicer, types.function);
  const _newName = await typeCheck(4, newName, types.string);
  const keep = await drop(dt, _varNames);
  const oldVars = await select(dt, _varNames);
  const oldObs = await toArray(oldVars); 
  const newValues = oldObs.map(_splicer);
  
  return assign(keep, { [_newName]: newValues });
};


// dataTable, string, function => array<dataTable>
const partition = async (dt, varName, classifier) => {
  const _dt = await typeCheck(1, dt, types.dataTable);
  const _varName = await typeCheck(2, varName, types.string);
  const _classifier = await typeCheck(3, classifier, types.function);
  const obs = await toArray(_dt);
  const classes = [...new Set(_dt[_varName].map(_classifier))];
  
  const r = (a, k) => {
    const byClass = obs.filter(x => _classifer(x[_varName]) === k);
    
    return [].concat(a, byClass);
  };
     
  return classes.reduce(r, []).map(fromArray);      
};


// dataTable, string, function, object => dataTable
const aggregate = async (dt, varName, classifier, aggregators) => {
  const _dt = await typeCheck(1, dt, types.dataTable);
  const _varName = await typeCheck(2, varName, types.string);
  const _classifier = await typeCheck(3, classifier, types.function);

};


// dataTable, array<string>, string, string => dataTable
const gather = async (dt, varNames, keyName, valueName) => {
  const _dt = await typeCheck(1, dt, types.dataTable);
  const _varNames = await typeCheck(2, varNames, types.stringArray);
  const _keyName = await typeCheck(3, keyName, types.string);
  const _valueName = await typeCheck(4, valueName, types.string);

  const r = (a, k) => {
    const valueArray = _dt[k];
    const keyArray = new Array(valueArray.length).fill(k);

    return map2(a, { [_keyName]: keyArray, [_valueName]: valueArray }, Array.prototype.concat);
  };
  
  return varNames.reduce(r, { [_keyName]: [], [_valueName]: [] });
};


// dataTable, string, string => dataTable
const spread = async (dt, keyName, valueName) => {
  const _keyName = await typeCheck(2, keyName, types.string);
  const _valueName = await typeCheck(3, valueName, types.string);
  const varNames = await unique(dt, keyName);

  const r = (a, k) => {
    const valueArray = _dt[_keyName].filter(x => x === k);
    
    return Object.assign({}, a, { [k]: valueArray });
  };
  
  return varNames.reduce(r, {});
};


//---PRINTING AND EXPORTING DATA---//

module.exports = {
  apply,
  apply2,
  pipe,
  map,
  map2,
  reduce,
  size,
  variables,
  observation,
  values,
  unique,
  describe,
  select,
  drop,
  include,
  assign,
  concat,
  head,
  sample,
  filter,
  arrange,
  append,
  cut,
  splice,
  partition,
  aggregate,
  gather,
  spread,
};
