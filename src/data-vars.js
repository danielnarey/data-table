// --SUBSETTING, COMBINING & RENAMING VARIABLE SETS-- //

const arr = {
  filter: require('@arr/filter'),
  reduce: require('@arr/reduce'),
};
const { types } = require('@danielnarey/data-types');
const { extensions } = require('./type-extensions');
const { typeCheck } = require('./type-errors');


// EXPOSED: MODULE, PACKAGE
// Map:DataTable, Array<String> => Map:DataTable
const select = async (dt, varNames) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  const _varNames = await typeCheck(2, varNames, types.StringArray);
  
  return arr.reduce(
    _varNames,
    (a, k) => a.set(k, _dt.get(k)),
    new Map(),
  );
};


// EXPOSED: MODULE, PACKAGE
// Map:DataTable, Array<String> => Map:DataTable
const drop = async (dt, varNames) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  const _varNames = await typeCheck(2, varNames, types.StringArray);
  
  return arr.reduce(
    _varNames,
    (a, k) => a.delete(k),
    new Map(_dt),
  );
};


// EXPOSED: MODULE, PACKAGE
// Map:DataTable, Function<Array => Boolean> => Map:DataTable
const include = async (dt, test) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  const _test = await typeCheck(2, test, types.Function);

  const varNames = arr.filter([..._dt.keys()], k => _test(_dt.get(k)));

  return arr.reduce(
    varNames,
    (a, k) => a.set(k, _dt.get(k)),
    new Map(),
  );
};


// EXPOSED: MODULE, PACKAGE
// Map:DataTable, Map<String;String> => Map:DataTable
const rename = async (dt, mapping) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  const _mapping = await typeCheck(2, mapping, types.Map);
  
  return arr.reduce(
    [..._mapping.keys()],
    (a, k) => a.delete(k).set(_mapping.get(k), _dt.get(k)),
    new Map(_dt),
  );
}


// EXPOSED: MODULE, PACKAGE
// Map:DataTable, Map:DataTable => Map:DataTable
const assign = async (dt1, dt2) => {
  const _dt1 = await typeCheck(1, dt1, types.Map, extensions.DataTable);
  const _dt2 = await typeCheck(2, dt2, types.Map, extensions.DataTable);
  
  if (size(_dt1).observations !== size(_dt2).observations) {
    throw new Error('Assign failed because the two data tables do not have the same number of observations (i.e., arrays are not all of the same length).');
  }
  
  return arr.reduce(
    [..._dt2.keys()],
    (a, k) => a.set(k, _dt2.get(k)),
    new Map(_dt1),
  );
};


// EXPOSED: MODULE, PACKAGE
// Array<Map:DataTable>, [Array<String>], [String] => Map:DataTable
const concat = async (dtArray, tableNames = [], separator = '$') => {
  const _dtArray = await typeCheck(1, dtArray, types.Array, extensions.DataTableArray);
  const _tableNames = await typeCheck(2, tableNames, types.StringArray);
  const _separator = await typeCheck(3, separator, types.String);
  
  if (!arr.every(_dtArray, x => size(x).observations === size(_dtArray[0]).observations)) {
    throw new Error('Concat failed because the data tables do not have the same number of observations (i.e., arrays are not all of the same length).');
  }
  
  const reducer = (a, dt, i) => {
    const prefix = (i < _tableNames.length) ? _tableNames[i] : `table${i}`;
    
    dt.forEach((valueArray, varName) => {
      a.set(`${prefix}${_separator}${varName}`, valueArray);
    });
  
    return a;
  };
  
  return arr.reduce(
    _dtArray, 
    reducer,
    new Map(),
  );
};


// EXPOSED: MODULE, PACKAGE
// Map:DataTable, String, Function<* => Map> => Map:DataTable
const cut = async (dt, varName, cutter) => {
  const _cutter = await typeCheck(3, cutter, types.Function);

  const newValues = arr.map(await values(dt, varName), _cutter);
  const newVars = [...newValues[0].keys()];
  
  return arr.reduce(
    newVars,
    (a, k) => a.set(k, arr.map(newValues, x => x.get(k))),
    await drop(dt, varName),
  );
};


// Map:DataTable, stringArray, Function<Map => Map> => Map:DataTable
const splice = async (dt, varNames, splicer) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  const _splicer = await typeCheck(3, splicer, types.Function);
  
  const oldValues = arr.map(await indexes(dt), x => arr.reduce(
    _varNames,
    (a, k) => a.set(k, _dt.get(k)[_n]),
    new Map(),
  );
    [..._dt.keys()],
    (a, k) => 
    [],

  const newValues = arr.map(await values(dt, varName), _cutter);
  const newVars = [...newValues[0].keys()];
  
  return arr.reduce(
    newVars,
    (a, k) => a.set(k, arr.map(newValues, x => x.get(k))),
    await drop(dt, varName),
  );
};


module.exports = {
  select,
  drop,
  include,
  rename,
  assign,
  concat,
  cut,
  splice,
};
