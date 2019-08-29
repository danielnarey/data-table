// -- APPLYING FUNCTIONS ON DATA TABLES & ACROSS VARIABLES -- //

const arr = {
  reduce: require('@arr/reduce'),
};
const { types } = require('@danielnarey/data-types');
const { extensions } = require('./type-extensions');
const { typeCheck } = require('./type-errors');


// EXPOSED: MODULE, PACKAGE 
// Map:DataTable, Function<DataTable, [**] => *>, [**] => * 
const apply = async (dt, f, ...args) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  const _f = await typeCheck(2, f, types.Function);
  
  return _f(...[].concat(new Map(_dt), args));
};


// EXPOSED: MODULE, PACKAGE 
// Map:DataTable, Map:DataTable, Function<DataTable, Map:DataTable, [**] => *>, [**] => *
const apply2 = async (dt1, dt2, f, ...args) => {
  const _dt1 = await typeCheck(1, dt1, types.Map, extensions.DataTable);
  const _dt2 = await typeCheck(2, dt2, types.Map, extensions.DataTable);
  const _f = await typeCheck(3, f, types.Function);
  
  return _f(...[].concat(new Map(_dt1), new Map(_dt2), args));
};


// EXPOSED: MODULE, PACKAGE
// Map:DataTable, Array<Function> => *
const pipe = async (dt, fArray) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  const _fArray = await typeCheck(2, fArray, types.FunctionArray);

  const iterator = (lastResult, i) => {
    if (i >= _fArray.length) {
      return lastResult;
    }
    
    return iterator(_fArray[i](lastResult), i + 1);
  }

  return iterator(new Map(_dt), 0);
};


// EXPOSED: MODULE, PACKAGE 
// Map:DataTable, Function<Array => *>, [Array<String>] => Map
const map = async (dt, f, varNames = null) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  const _f = await typeCheck(2, f, types.Function);
  
  const _varNames = !varNames ? [..._dt.keys()] : await typeCheck(3, varNames, types.StringArray);

  return arr.reduce(
    _varNames,
    (a, k) => a.set(k, _f(a.get(k))),
    new Map(_dt),
  );
};


// EXPOSED: MODULE, PACKAGE 
// Map:DataTable, Map:DataTable, Function<Array, Array => *>, [Array<String>] => Map
const map2 = async (dt1, dt2, f, varNames = null) => {
  const _dt1 = await typeCheck(1, dt1, types.Map, extensions.DataTable);
  const _dt2 = await typeCheck(2, dt2, types.Map, extensions.DataTable);
  const _f = await typeCheck(3, f, types.Function);
  
  const _varNames = !varNames ? arr.filter([..._dt1.keys()], x => _dt2.has(x)) : await typeCheck(4, varNames, types.StringArray);

  return arr.reduce(
    _varNames,
    (a, k) => a.set(k, _f(a.get(k), b.get(k))),
    new Map(_dt),
  );
};


// EXPOSED: MODULE, PACKAGE
// Map:DataTable, Function<*, Array, String => *>, *, [Array<String>] => *   
const reduce = async (dt, r, initial, varNames = null) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  const _r = await typeCheck(2, r, types.Function);
  const _initial = await initial;
  
  const _varNames = !varNames ? [..._dt.keys()] : await typeCheck(4, varNames, types.StringArray);

  const iterator = (a, i) => {
    if (i >= _varNames.length) {
      return a;
    }
    
    return iterator(_r(a, _dt.get(_varNames[i]), _varNames[i]), i + 1);
  }

  return iterator(initial, 0);
};


module.exports = {
  apply,
  apply2,
  pipe,
  map,
  map2,
  reduce,
};