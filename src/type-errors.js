//---HANDLING TYPE ERRORS---//

const { whatType } = require('./type-check-sync');
const checkAsync = require('./type-check-async');


// INTERNAL
// number:boundedInt<1;5> => string
const ordinalString = n => {
  if (!Number.isInteger(n) || n < 1 || n > 7) {
    throw new Error('Improper argument to `ordinalString` function: (number:boundedInt<1;7> => string)');
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
// DEFINE typeDef $= object:{ desc$string, test$function<[*] => boolean> }
// number:boundedInt<1;5>, promise, typeDef, [typeDef] => promise
const typeCheck = async (ordinal, promise, { desc, test }, extended = null) => {
  if (!(await test(promise))) {
    throw new TypeError(`${ordinalString(ordinal)} argument: Expected ${desc}, but got ${whatType(promise)}.`);
  }
  
  const value = await promise;

  if (extended && !(extended.test(value))) {
    throw new TypeError(`${ordinalString(ordinal)} argument: Expected ${extended.desc}.`);
  }
  
  return value;
};


// EXPOSED: MODULE
// number:boundedInt<1;5>, promise, array<typeDef>, [array<typeDef>] => promise
const typeCheckAny = async (ordinal, promise, typeDefs, extensions = []) => { 
  const iterator = async (i) => {
    if (i >= typeDefs.length) {
      const oneOf = typeDefs.map(td => td.desc).join(' *OR* ');
      throw new TypeError(`${ordinalString(ordinal)} argument: Expected ${oneOf}.`);
    }
    
    try {
      return await typeCheck(ordinal, promise, typeDefs[i], extensions[i]);
    } catch {
      return iterator(i + 1);    
    }
  }

  return await iterator(0);
};


// EXPOSED: MODULE
// object:{ ::typeDef }
const types = {
  string: {
    desc: 'a string or a promise resolving to a string',
    test: checkAsync.isString,
  },
  number: {
    desc: 'a number or a promise resolving to a number',
    test: checkAsync.isNumber,
  },
  boolean: {
    desc: 'a boolean or a promise resolving to a boolean',
    test: checkAsync.isBoolean,
  },
  function: {
    desc: 'a function or a promise resolving to a function',
    test: checkAsync.isFunction,
  },
  object: {
    desc: 'an object or a promise resolving to an object',
    test: checkAsync.isObject,
  },
  array: {
    desc: 'an array or a promise resolving to an array',
    test: checkAsync.isArray,
  },
  stringArray: {
    desc: 'a string array or a promise resolving to a string array',
    test: checkAsync.isStringArray,
  },
  numberArray: {
    desc: 'a number array or a promise resolving to a number array',
    test: checkAsync.isNumberArray,
  },
  booleanArray: {
    desc: 'a boolean array or a promise resolving to a boolean array',
    test: checkAsync.isBooleanArray,
  },
  functionArray: {
    desc: 'a function array or a promise resolving to a boolean array',
    test: checkAsync.isFunctionArray,
  },
  dataTable: {
    desc: 'a data table or a promise resolving to a data table',
    test: checkAsync.isDataTable,
  },
  dataTableArray: {
    desc: 'an array of data tables (or promises resolving to data tables)',
    test: x => x.every(checkAsync.isDataTable),
  },
};


// EXPOSED: MODULE
// object:{ ::typeDef }
const extensions = {
  int: {
    desc: 'an integer',
    test: Number.isInteger,
  },
  boundedInt: (min, max) => ({
    desc: `an integer not less than ${min} and not greater than ${max}`,
    test: n => Number.isInteger(n) && n >= min && n <= max,
  }),
  leftBoundedInt: (min) => ({
    desc: `an integer not less than ${min}`,
    test: n => Number.isInteger(n) && n >= min,
  }),
  hasKeys: (keys) => ({
    desc: `an object with the following keys: ${keys.join(', ')}`,
    test: obj => keys.every(k => Object.keys(obj).includes(k)),
  }),
};


module.exports = {
  typeCheck,
  typeCheckAny,
  types,
  extensions,
};