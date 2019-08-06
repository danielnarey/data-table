//---BASIC TYPE CHECKING---//

// INTERNAL
// [*] => string
const whatType = (value) => {
  if (value === undefined) {
    return 'Undefined';
  }

  if (value === null) {
    return 'Null';
  }

  return Object.prototype.toString.call(value).slice(8, -1);
};


// INTERNAL
// [*] => boolean
const isPrimitive = type => value => {
  try {
    return whatType(value) === type;
  } catch {
    return false;
  }
};


// INTERNAL
// [*] => boolean
const isTypedArray = type => array => {
  try {
    if (whatType(array) !== 'Array') {
      return false;
    }
  
    return array.every(x => whatType(x) === type);
  } catch {
    return false;
  }
};
 

// EXPOSED: MODULE, PACKAGE
// [*] => boolean
const isDataTable = dt => {
  if (whatType(dt) !== 'Object') {
    return false;
  }

  const keys = Object.keys(dt);

  if (keys.length === 0) {
    return false;
  }

  const valueTypes = keys.map(k => whatType(dt[k]));

  if (!valueTypes.every(x => (x === 'Array'))) {
    return false;
  }

  const arrayLengths = keys.map(k => dt[k].length);

  if (!arrayLengths.every(x => (x === arrayLengths[0]))) {
    return false;
  }

  return true;
};


module.exports = {
  whatType,
  isString: isPrimitive('String'),
  isNumber: isPrimitive('Number'),
  isBoolean: isPrimitive('Boolean'),
  isFunction: isPrimitive('Function'),
  isObject: isPrimitive('Object'),
  isArray: isPrimitive('Array'),
  isStringArray: isTypedArray('String'),
  isNumberArray: isTypedArray('Number'),
  isBooleanArray: isTypedArray('Boolean'),
  isFunctionArray: isTypedArray('Function'),
  isDataTable,
};