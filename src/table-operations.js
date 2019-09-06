import arr from './arr';


const nObs = (dt) => dt.values().next().value.length;


const indexes = (dt) => Uint32Array.from(
  { length: ops.nObs(dt) }, 
  (x, i) => i,
);


const rm = (mp, key) => {
  const out = new Map(mp);
  
  out.delete(key);
  
  return out;
};


const drop = (mp, keys) => {
  const out = new Map(mp);
  
  arr.forEach(
    keys,
    (k) => out.delete(k),
  ),
  
  return out;
};


const newTable = (varNames) => arr.reduce(
  varNames,
  (a, k) => a.set(k, []),
  new Map(),
);


const mapKeys = (mp, callback) => {
  const out = new Map();
  
  mp.forEach((value, key) => {
    out.set(callback(key), value);
  });

  return out;
};


const mapValues = (mp, callback) => {
  const out = new Map();
  
  mp.forEach((value, key) => {
    out.set(key, callback(value, key));
  });

  return out;
};


const mapEntries = (mp, callback) => arr.reduce(
  [...mp.entries()],
  (a, kv) => new Map([...a, callback(kv)]),
  new Map(),
);


const mapSelected = (mp, names, callback) => {
  const out = new Map();
  
  arr.forEach(
    names,
    (k) => out.set(k, callback(mp.get(k), k)),
  ),
  
  return out;
};


const pushNext = (src, dest, i) => mapValues(
  src,
  (srcArray, varName) => dest.get(varName).push(srcArray[i]),
);


const copyPasteTypes = (src, dest) => mapValues(
  src,
  (srcArray, varName) => srcArray.constructor.from(dest.get(varName)),
);


export default {
  copyPasteTypes,
  indexes,
  mapEntries,
  mapKeys,
  mapValues,
  newTable,
  nObs,
  pushNext,
};