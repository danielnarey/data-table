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
  if (whatType(dt) !== 'Map') {
    return false;
  }

  if (dt.size === 0) {
    return false;
  }


  if (![...dt.values()].every(x => isPrimitive('Array')(x) || isTypedArray()(x))) {
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
  isDate: isPrimitive('Date'),
  isFunction: isPrimitive('Function'),
  isObject: isPrimitive('Object'),
  isArray: isPrimitive('Array'),
  isStringArray: isTypedArray('String'),
  isNumberArray: isTypedArray('Number'),
  isBooleanArray: isTypedArray('Boolean'),
  isDateArray: isTypedArray('Date'),
  isFunctionArray: isTypedArray('Function'),
  isDataTable,
};