//---HANDLING TYPE ERRORS---//

const { checkSync, checkAsync } = require('data-types');


// INTERNAL
// number:boundedInt<1;7> => string
const ordinalString = n => {
  if (!Number.isInteger(n) || n < 1 || n > 7) {
    throw new Error('Improper argument to `ordinalString` function: (Number:BoundedInt<1;7> => String)');
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


module.exports = {
  typeCheck,
};