const arr = {
  every: require('@arr/every'),
  includes: require('@arr/includes'),
};
const { checkSync, checkAsync } = require('@danielnarey/data-types');


// EXPOSED: MODULE, PACKAGE
// Map => Boolean
const isDataTable = (mp) => {
  if (mp.size === 0) {
    return false;
  }
  
  const values = [...mp.values()];

  if (!every(values, x => checkSync.isArray(x) || checkSync.isTypedArray(x))) {
    return false;
  }

  if (!every(values, x => x.length === values[0].length)) {
    return false;
  }

  return true;
};


// EXPOSED: MODULE
// object:{ _${ desc$String, test$Function<* => Boolean> } }
const extensions = {
  Int: {
    desc: 'an integer',
    test: Number.isInteger,
  },
  BoundedInt: (min, max) => ({
    desc: `an integer not less than ${min} and not greater than ${max}`,
    test: n => Number.isInteger(n) && n >= min && n <= max,
  }),
  LeftBoundedInt: (min) => ({
    desc: `an integer not less than ${min}`,
    test: n => Number.isInteger(n) && n >= min,
  }),
  HasKeys: (keys) => ({
    desc: `an object with the following keys: ${keys.join(', ')}`,
    test: obj => arr.every(keys, k => arr.includes(Object.keys(obj), k)),
  }),
  DataTable: {
    desc: 'a Data Table (defined as a Map with at least one entry, where the values are standard arrays and/or TypedArray buffers, all of equal length)',
    test: isDataTable,
  },
  DataTableArray: {
    desc: 'an Array of Data Tables',
    test: a => arr.every(a, x => isDataTable(x)),
  },
};


module.exports = {
  isDataTable,
  extensions,
};
