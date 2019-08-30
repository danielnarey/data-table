// -- DESCRIBING DATA TABLES & RETRIEVING VALUE AND INDEX ARRAYS -- //


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
