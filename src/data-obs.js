//---SUBSETTING & COMBINING OBSERVATION SETS---//

const { map } = require('./data-apply');
const { fromArray } = require('./data-import');
const { toArray } = require('./data-export');
const stats = require('simple-statistics');


/**
 * EXPOSED by MODULE, PACKAGE as sample
 * # Returns a data table containing a random sample of *n* observations
 * # from *dt*
 * @dt ^Map:DataTable -> `awaits Map [more precisely: DataTable]`
 * @n ^Number:Int<1> -> `awaits Number [more precisely: Int (n >= 1)]`
 * @@ ^Map:DataTable -> `rejects or resolves to Map [more precisely: DataTable]`
 */
const sample = async (dt, n) => {
  const _n = await typeCheck(2, n, types.Number, extensions.LeftBoundedInt(1));

  const selected = stats.sample(await indexes(dt), _n);
  
  const callback = x => arr.reduce(
    selected,
    (a, k, i) => a[i] = k,
    new x.constructor(selected.length),
  );

  return map(dt, callback);
};


// EXPOSED: MODULE, PACKAGE
// Map:DataTable, Function<object => boolean> => Map:DataTable
const filter = async (dt, varName, test) => {
  const selected = await whichObs(dt, varName, test);
  
  const callback = x => arr.reduce(
    selected,
    (a, k, i) => a[i] = k,
    new x.constructor(selected.length),
  );

  return map(dt, callback);
};


// EXPOSED: MODULE, PACKAGE
// Map:DataTable, Map:DataTable => Map:DataTable
const append = (dt1, dt2) => map2(dt1, dt2, Array.prototype.concat);


//---REORDERING AND TRANSFORMING TABLES---//

// Map:DataTable, Function<object => number> => Map:DataTable
const arrange = async (dt, compare) => {
  const _compare = await typeCheck(2, test, types.Function);
  const obs = await toArray(dt);
  
  return fromArray(obs.sort(_compare));
};





// Map:DataTable, string, Function => array<DataTable>
const partition = async (dt, varName, classifier) => {
  const _dt = copy(await typeCheck(1, dt, types.Map, extensions.DataTable));
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