const stats = require('simple-statistics');
const checkSync = require('./type-check-sync');
const { typeCheck, types, extensions } = require('./type-errors');
const { fromArray } = require('./data-import');
const { toArray } = require('./data-export');


//---Function APPLICATION (WITH IMPLICIT PROMISE CHAINING)---//

// EXPOSED 
// DataTable, Function<DataTable, [**] => *>, [**] => * 
const apply = async (dt, f, ...args) => {
  const _dt = await typeCheck(1, dt, types.DataTable);
  const _f = await typeCheck(2, f, types.Function);
  
  return _f(...[].concat(new Map(_dt), args));
};


// EXPOSED 
// DataTable, DataTable, Function<DataTable, DataTable, [**] => *>, [**] => *
const apply2 = async (dt1, dt2, f, ...args) => {
  const _dt1 = await typeCheck(1, dt1, types.DataTable);
  const _dt2 = await typeCheck(2, dt2, types.DataTable);
  const _f = await typeCheck(3, f, types.Function);
  
  return _f(...[].concat(new Map(_dt1), new Map(_dt2), args));
};


//---HIGHER ORDER FUNCTIONS---//

// EXPOSED
// DataTable, array<Function> => *
const pipe = async (dt, fArray) => {
  const _dt = await typeCheck(1, dt, types.DataTable);
  const _fArray = await typeCheck(2, fArray, types.FunctionArray);

  const iterator = (lastResult, i) => {
    if (i >= _fArray.length) {
      return lastResult;
    }
    
    return iterator(_fArray[i](lastResult), i + 1);
  }

  return iterator(new Map(_dt), 0);
};


// EXPOSED 
// DataTable, Function<array => *>, [array<string>] => object
const map = async (dt, f, varNames = null) => {
  const _dt = await typeCheck(1, dt, types.DataTable);
  const _f = await typeCheck(2, f, types.Function);
  
  const _varNames = (!varNames) ? [..._dt.keys()] : await typeCheck(3, varNames, types.StringArray);

  return reduce(
    _varNames,
    (a, k) => a.set(k, _f(a.get(k))),
    new Map(_dt),
  );
};


// EXPOSED 
// DataTable, Function<array => *>, [array<string>] => object
const map2 = async (dt1, dt2, f, varNames = null) => {
  const _dt1 = await typeCheck(1, dt1, types.DataTable);
  const _dt2 = await typeCheck(2, dt2, types.DataTable);
  const _f = await typeCheck(3, f, types.Function);
  
  const _varNames = (!varNames) ? filter([..._dt1.keys()], x => includes([..._dt2.keys()], x)) : await typeCheck(4, varNames, types.StringArray);

  return reduce(
    _varNames,
    (a, k) => a.set(k, _f(a.get(k), b.get(k))),
    new Map(_dt),
  );
};


// EXPOSED
// DataTable, Function<*, array, string => *>, *, [array<string>] => *   
const reduce = async (dt, r, initial, varNames = null) => {
  const _dt = await typeCheck(1, dt, types.DataTable);
  const _r = await typeCheck(2, r, types.Function);
  const _initial = await initial;
  
  const _varNames = (!varNames) ? [..._dt.keys()] : await typeCheck(4, varNames, types.StringArray);

  const iterator = (a, i) => {
    if (i >= _varNames.length) {
      return a;
    }
    
    return iterator(_r(a, _dt.get(_varNames[i]), _varNames[i]), i + 1);
  }

  return iterator(initial, 0);
};


//---GETTING TABLE SIZE, VARIABLE NAMES, AND VALUES---//

// EXPOSED
// DataTable => object:{variables$number:int, observations$number:int}
const size = async (dt) => {
  const varNames = await variables(dt);
  const firstArray = await values(dt, varNames[0]);

  return {
    variables: varNames.length,
    observations: .length,
  };
};


// EXPOSED
// DataTable => array<string>
const variables = dt => apply(dt, Object.keys);


// EXPOSED
// DataTable, number:int => object
const observation = async (dt, n) => {
  const _n = await typeCheck(2, n, types.number, extensions.int);

  return map(dt, x => x[_n]);
}


// EXPOSED
// DataTable, string => array
const values = async (dt, varName) => {
  const _varName = await typeCheck(2, varName, types.string);

  return apply(dt, x => x[_varName]);
};


// EXPOSED
// DataTable, string => array
const unique = async (dt, varName) => {
  const valueArray = await values(dt, varName);
  
  return [...new Set(valueArray)];
};


// EXPOSED
// DataTable => object
const describe = async (dt) => {

};


//---RENAMING, SUBSETTING, AND COMBINING VARIABLE SETS---//

// EXPOSED
// DataTable, array<string> => DataTable
const select = async (dt, varNames) => {
  const _dt = copy(await typeCheck(1, dt, types.DataTable));
  const _varNames = await typeCheck(2, varNames, types.stringArray);
  
  const r = (a, k) => Object.assign({}, a, { [k]: _dt[k] });
  
  return _varNames.reduce(r, {});
};


// EXPOSED
// DataTable, array<string> => DataTable
const drop = async (dt, varNames) => {
  const _dt = copy(await typeCheck(1, dt, types.DataTable));
  const _varNames = await typeCheck(2, varNames, types.stringArray);
  const keep = Object.keys(_dt).filter(v => !_varNames.includes(v));
  
  const r = (a, k) => Object.assign({}, a, { [k]: _dt[k] });
  
  return keep.reduce(r, {});
};


// EXPOSED
// DataTable, Function<array => boolean> => DataTable
const include = async (dt, test) => {
  const _dt = copy(await typeCheck(1, dt, types.DataTable));
  const _test = await typeCheck(2, test, types.Function);

  const keep = Object.keys(_dt).filter(v => _test(_dt[v]));

  return select(_dt, keep);
};


// EXPOSED
// DataTable, object => DataTable
const rename = async (dt, mapping) => {
  const _dt = copy(await typeCheck(1, dt, types.DataTable));
  const _mapping = await typeCheck(2, mapping, types.object);
  
  const r = (a, k) => Object.assign({}, a, { [_mapping[k]]: _dt[k] });
  
  const oldNames = Object.keys(_mapping);
  const remaining = drop(_dt, oldNames);
  
  return Object.assign({}, remaining, oldNames.reduce(r, {}));
}


// EXPOSED
// DataTable, DataTable => DataTable
const assign = async (dt1, dt2) => {
  const f = (a, b) => Object.assign({}, a, b);
  const result = await apply2(dt1, dt2, f);
  
  if (!(checkSync.isDataTable(result))) {
    throw new Error('Assign failed because the two data tables do not have the same number of observations (i.e., arrays are not all of the same length).');
  }
  
  return result;
};


// EXPOSED
// array<DataTable>, [array<string>], [string] => DataTable
const concat = async (dtArray, tableNames = [], separator = '$') => {
  const _dtArray = await typeCheck(1, dtArray, types.DataTableArray);
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
// DataTable, number:leftBoundedInt(1) => DataTable
const head = async (dt, n = 5) => {
  const _n = await typeCheck(2, n, types.number, extensions.leftBoundedInt(1));

  return map(dt, x => x.slice(0, _n));
};


// EXPOSED
// DataTable, number:leftBoundedInt(1) => DataTable
const sample = async (dt, n) => {
  const _n = await typeCheck(2, n, types.number, extensions.leftBoundedInt(1));
  const varNames = await variables(dt);
  const firstArray = await values(dt, varNames[0]);
  const selected = stats.sample([...firstArray.keys()], _n);

  return map(dt, x => x.filter((c, i) => selected.includes(i)));
};


// EXPOSED
// DataTable, Function<object => boolean> => DataTable
const filter = async (dt, test) => {
  const _test = await typeCheck(2, test, types.Function);
  const obs = await toArray(dt);
  
  return fromArray(obs.filter(_test));
};


// EXPOSED
// DataTable, DataTable => DataTable
const append = async (dt1, dt2) => map2(dt1, dt2, Array.prototype.concat);


//---REORDERING AND TRANSFORMING TABLES---//

// DataTable, Function<object => number> => DataTable
const arrange = async (dt, compare) => {
  const _compare = await typeCheck(2, test, types.Function);
  const obs = await toArray(dt);
  
  return fromArray(obs.sort(_compare));
};


// DataTable, string, Function<* => object> => DataTable
const cut = async (dt, varName, cutter) => {
  const _varName = typeCheck(2, varName, types.string);
  const _cutter = typeCheck(3, cutter, types.Function);
  const oldValues = await values(dt, _varName);
  const newVars = fromArray(oldValues.map(_cutter));
  
  return assign(dt, newVars);
};


// DataTable, stringArray, Function<object => *> => DataTable
const splice = async (dt, varNames, splicer, newName) => {
  const _varNames = await typeCheck(2, varName, types.stringArray);
  const _splicer = await typeCheck(3, splicer, types.Function);
  const _newName = await typeCheck(4, newName, types.string);
  const keep = await drop(dt, _varNames);
  const oldVars = await select(dt, _varNames);
  const oldObs = await toArray(oldVars); 
  const newValues = oldObs.map(_splicer);
  
  return assign(keep, { [_newName]: newValues });
};


// DataTable, string, Function => array<DataTable>
const partition = async (dt, varName, classifier) => {
  const _dt = copy(await typeCheck(1, dt, types.DataTable));
  const _varName = await typeCheck(2, varName, types.string);
  const _classifier = await typeCheck(3, classifier, types.Function);
  const obs = await toArray(_dt);
  const classes = [...new Set(_dt[_varName].map(_classifier))];
  
  const r = (a, k) => {
    const byClass = obs.filter(x => _classifer(x[_varName]) === k);
    
    return [].concat(a, byClass);
  };
     
  return classes.reduce(r, []).map(fromArray);      
};


// DataTable, string, Function, object => DataTable
const aggregate = async (dt, varName, classifier, aggregators) => {
  const _dt = copy(await typeCheck(1, dt, types.DataTable));
  const _varName = await typeCheck(2, varName, types.string);
  const _classifier = await typeCheck(3, classifier, types.Function);

};


// DataTable, array<string>, string, string => DataTable
const gather = async (dt, varNames, keyName, valueName) => {
  const _dt = copy(await typeCheck(1, dt, types.DataTable));
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


// DataTable, string, string => DataTable
const spread = async (dt, keyName, valueName) => {
  const _dt = copy(await typeCheck(1, dt, types.DataTable));
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
  rename,
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
