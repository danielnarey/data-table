







// Map:DataTable, string, Function, object => Map:DataTable
const aggregate = async (dt, varName, classifier, aggregators) => {
  const _dt = copy(await typeCheck(1, dt, types.Map, extensions.DataTable));
  const _varName = await typeCheck(2, varName, types.string);
  const _classifier = await typeCheck(3, classifier, types.Function);

};

// Map:DataTable, array<string>, string, string => Map:DataTable
const gather = async (dt, varNames, keyName, valueName) => {
  const _dt = copy(await typeCheck(1, dt, types.Map, extensions.DataTable));
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


// Map:DataTable, string, string => Map:DataTable
const spread = async (dt, keyName, valueName) => {
  const _dt = copy(await typeCheck(1, dt, types.Map, extensions.DataTable));
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