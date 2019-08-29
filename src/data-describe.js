// -- DESCRIBING DATA TABLES & RETRIEVING VALUE AND INDEX ARRAYS -- //

const arr = {
  forEach: require('@arr/foreach'),
};
const { types } = require('@danielnarey/data-types');
const { extensions } = require('./type-extensions');
const { typeCheck } = require('./type-errors');


// EXPOSED: MODULE, PACKAGE
// Map:DataTable => Object:{ variables$Number:LeftBoundedInt(1), observations$Number:LeftBoundedInt(0) }
const size = async (dt) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);

  return {
    variables: _dt.size,
    observations: _dt.values().next().value.length,
  };
};


// EXPOSED: MODULE, PACKAGE
// Map:DataTable, Number:LeftBoundedInt(1) => Map
const head = async (dt, n = 5) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  const _n = await typeCheck(2, n, types.Number, extensions.LeftBoundedInt(1));

  return arr.reduce(
    [..._dt.keys()],
    (a, k) => a.set(k, _dt.get(k).slice(0, _n)),
    new Map(),
  );
};


// EXPOSED: MODULE, PACKAGE
// Map:DataTable => Array<String>
const varNames = async (dt) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);

  return [..._dt.keys()];
};


// EXPOSED: MODULE, PACKAGE
// Map:DataTable, String => Array
const values = async (dt, varName) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  const _varName = await typeCheck(2, varName, types.String);

  return _dt.get(_varName);
};


// EXPOSED: MODULE, PACKAGE
// Map:DataTable => Array<Number:LeftBoundedInt(0)>
const indexes = async (dt) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  
  return [..._dt.values().next().value.keys()];
};


// EXPOSED: MODULE, PACKAGE
// Map:DataTable, Number:LeftBoundedInt(0) => Map
const nthObs = async (dt, n) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  const _n = await typeCheck(2, n, types.Number, extensions.LeftBoundedInt(0));

  return arr.reduce(
    [..._dt.keys()],
    (a, k) => a.set(k, _dt.get(k)[_n]),
    new Map(),
  );
};


// EXPOSED: MODULE, PACKAGE
// Map:DataTable, String, Function<* => Boolean> => Array<Number:LeftBoundedInt(0)>
const whichObs = async (dt, varName, test) => {
  const _test = await typeCheck(3, test, types.Function);
  const out = [];
  
  arr.forEach(await values(dt, varName), (x, i) => {
    if (_test(x)) {
      out.push(i);
    }
  });
  
  return out;
};


// EXPOSED: MODULE, PACKAGE
// Map:DataTable => Map
const describe = async (dt) => {

};


module.exports = {
  size,
  head,
  varNames,
  values,
  indexes,
  nthObs,
  whichObs,
  describe,
};
