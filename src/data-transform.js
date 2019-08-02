const fs = require('fs-extra');
const got = require('got');
const neatCsv = require('neat-csv');
const stats = require('simple-statistics');
const { typeCheck, types, extensions } = require('./type-errors.js');




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
    
    return iterator(apply(lastResult, _fArray[i]), i + 1);
  }

  return iterator(_dt, 0);
};


// EXPOSED 
// dataTable, function<array => *> => object
const map = async (dt, f) => {
  const _f = await typeCheck(2, f, types.function);
  const varNames = await variables(dt);

  const r = obj => (a, k) => Object.assign({}, a, { [k]: _f(obj[k]) });
  const f = obj => varNames.reduce(r(obj), {});

  return apply(dt, f);
};


// EXPOSED
// dataTable, function<*, array, string>, * => *   
const reduce = async (dt, r, initial) => {
  const _dt = await typeCheck(1, dt, types.dataTable);
  const _r = await typeCheck(2, r, types.function);
  const varNames = Object.keys(_dt);

  const iterator = (accumulator, i) => {
    if (i >= varNames.length) {
      return accumulator;
    }
    
    return iterator(_r(accumulator, await _dt[varNames[i]], varNames[i]), i + 1);
  }

  return iterator(await initial, 0);
};


//---GETTING TABLE SIZE, VARIABLE NAMES, AND VALUE ARRAYS---//

// EXPOSED
// dataTable => object:{variables$number:int, observations$number:int}
const size = async (dt) => {
  const varNames = await variables(dt);
  const firstArray = await observations(dt, varNames[0]);

  return {
    variables: varNames.length,
    observations: firstArray.length,
  };
};


// EXPOSED
// dataTable => array<string>
const variables = dt => apply(dt, Object.keys);


// EXPOSED
// dataTable, string => array
const values = async (dt, varName) => {
  const _varName = await typeCheck(2, varName, types.string);

  return apply(dt, x => x[_varName]);
};


// EXPOSED
// dataTable, string => array
const unique = async (dt, varName) => {

};


// EXPOSED
// dataTable => object
const describe = async (dt) => {

};


//---SUBSETTING AND COMBINING VARIABLE SETS---//

// EXPOSED
// dataTable, array<string> => dataTable
const select = async (dt, varNames) => {
  const _varNames = await typeCheck(2, varNames, types.stringArray);

  const r = obj => (a, k) => Object.assign({}, a, { [k]: obj[k] });
  const f = obj => _varNames.reduce(r(obj), {});

  return apply(dt, f);
};


// EXPOSED
// dataTable, function<array => boolean> => dataTable
const include = async (dt, test) => {
  const _dt = await typeCheck(1, dt, types.dataTable);
  const _test = await typeCheck(2, test, types.function);

  const varNames = await variables(_dt);
  const included = varNames.filter(v => test(_dt[v]));

  return select(_dt, included);
};


// EXPOSED
// dataTable, dataTable => dataTable
const assign = async (dt1, dt2) => {
  const f = (a, b) => Object.assign({}, a, b);
  const combined = await apply2(dt1, dt2, f);
  
  if (!(await isDataTable(combined))) {
    throw new Error('Assign failed because the two data tables do not have the same number of observations (i.e., arrays are not of the same length).');
  }
  
  return combined;
};


// EXPOSED
// array<dataTable>, [array<string>], [string] => dataTable
const concat = async (dtArray, tableNames = [], separator = ':') => {
  const _dtArray = typeCheck(1, dtArray, types.dataTableArray);
  const _tableNames = typeCheck(2, tableNames, types.stringArray);
  const _separator = typeCheck(3, separator, types.string);
  
  const r1 = obj => (a, k, i) => {
    const prefix = (i < _tableNames.length) ? _tableNames[i] : `table-${i}`;
    return Object.assign({}, a, { [`${prefix}${_separator}${k}`]: obj[k] });
  };
  
  const r2 = (a, k) => {
    const prefixed = Object.keys(k).reduce(r1, {});
    return Object.assign({}, a, prefixed);
  };
  
  return _dtArray.reduce(r2, {});
};


//---SUBSETTING AND COMBINING OBSERVATION SETS---//

// EXPOSED
// dataTable, number:leftBoundedInt(1) => dataTable
const head = async (dt, n = 5) => {
  const _n = typeCheck(2, n, types.number, extensions.leftBoundedInt(1));

  return map(dt, x => x.slice(0, _n));
};


// EXPOSED
// dataTable, number:leftBoundedInt(1) => dataTable
const sample = async (dt, n) => {
  const _n = typeCheck(2, n, types.number, extensions.leftBoundedInt(1));
  const varNames = await variables(dt);
  const firstArray = await observations(dt, varNames[0]);
  
  const selected = stats.sample([...firstArray.keys()], _n);
  const f = x => x.filter((c, i) => selected.includes(i));

  return map(dt, f);
};


// EXPOSED
// dataTable, function<object => boolean> => dataTable
const filter = async (dt, test) => {

};


// EXPOSED
// dataTable, dataTable => dataTable
const append = async (dt1, dt2) => {

};


//---REORDERING AND TRANSFORMING TABLES---//

// dataTable, function<object => number> => dataTable
const arrange = async (dt, compare) => {

};

const classify

const cut 

const splice

const spread

const gather

const aggregate






//---PRINTING AND EXPORTING DATA---//

module.exports = {
  isDataTable,
  fromArray,
  fromCsv,
  fromJsonArray,
  fromJsonTable,
  fromRemoteCsv,
  fromRemoteJsonArray,
  fromRemoteJsonTable,
  previewDataFile,
  previewRemoteData,
  apply,
  apply2,
  mapVars,
  mapValues,
  head,
  size,
  // describe, - like pandas function
  variables,
  observations,
  // select, - drop variables not selected
  assign,
  // filter,
  sample,
  // arrange, - reorder indexes
  // reduce, - example: combining m d y min sec to datetime
  // aggregate,
  // spread,
  // gather,
  // display, - pretty print table
  // outputJsonArray,
  // outputJsonTable,
};
