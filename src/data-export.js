const { typeCheck, types, extensions } = require('./type-errors.js');

// EXPOSED
const toArray = async (dt) => {
  const _dt = await typeCheck(1, dt, types.dataTable);
  const varNames = Object.keys(_dt);
  const firstArray = _dt[varNames[0]];
  const r = i => (a, k) => Object.assign({}, a, { [k]: _dt[k][i] });
  
  return [...firstArray.keys()].map(i => varNames.reduce(r(i), {}));
};


modules.exports = {
  toArray,
  // display,
  // outputJson,
};