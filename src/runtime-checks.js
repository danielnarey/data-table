import { checkSync, checkAsync, types } from '@danielnarey/data-types';
import arr from './arr';


// INTERNAL
// number:boundedInt<1;7> => string
const ordinalString = n => {
  if (!Number.isInteger(n) || n < 1 || n > 7) {
    throw new Error('Improper argument to `ordinalString` function: (Number:Int<1;7> => String)');
  }

  return [
    'First',
    'Second',
    'Third',
    'Fourth',
    'Fifth',
    'Sixth',
    'Seventh',
  ][n - 1];
};
  

// EXPOSED: MODULE
// Number:BoundedInt<1;7>, *|Promise<*>, [String], [Object:{ desc$String, test$Function }] => Promise<*>
const typeCheck = async (ordinal, promise, expected = null, extended = null) => {
  if (await checkAsync.isRejected(promise)) {
    throw new TypeError(`${ordinalString(ordinal)} argument: Promise was rejected`.);
  }
  
  const value = await promise;
  
  if (expected && !checkSync[`is${expected}`](value)) {
    throw new TypeError(`${ordinalString(ordinal)} argument: Expected ${expected}, but got ${checkSync.whatType(value)}.`);
  }

  if (extended && !(extended.test(value))) {
    throw new TypeError(`${ordinalString(ordinal)} argument: Expected ${extended.desc}.`);
  }
  
  return value;
};


// EXPOSED: MODULE
// Map => Boolean
const isDataTableSync = (mp) => {
  if (mp.size === 0) {
    return false;
  }
  
  const values = [...mp.values()];

  if (!arr.every(values, x => checkSync.isArray(x) || checkSync.isTypedArray(x))) {
    return false;
  }

  if (!arr.every(values, x => x.length === values[0].length)) {
    return false;
  }

  return true;
};


// EXPOSED: MODULE
// object:{ _${ desc$String, test$Function<* => Boolean> } }
const extensions = {
  Int: (min = null, max = null) => ({
    desc: `an integer not less than ${min} and not greater than ${max}`,
    test: n => Number.isInteger(n) && n >= min && n <= max,
  }),
  HasKeys: (keys) => ({
    desc: `an object with the following keys: ${keys.join(', ')}`,
    test: obj => arr.every(keys, k => arr.includes(Object.keys(obj), k)),
  }),
  DataTable: {
    desc: 'a Data Table (defined as a Map with at least one entry, where the values are equal-length standard arrays or TypedArray buffers)',
    test: isDataTableSync,
  },
  DataTableArray: {
    desc: 'an Array of Data Tables',
    test: a => arr.every(a, x => checkSync.isMap(x) && isDataTableSync(x)),
  },
};


export default {
  typeCheck,
  types,
  extensions,
};
