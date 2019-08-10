//---CONVERT A SINGLE VALUE TO STRING, NUMBER, BOOLEAN, OR DATE---//

const { whatType } = require('./type-check-sync');


// EXPOSED: MODULE, PACKAGE
// *, [array<object:{ key$*, value$string }>], [object:{ Undefined$string, Null$string, ... }] => string
const toString = (value, mapping = [], missingValues = { Undefined: '', Null: '' }) => {
  const valueType = whatType(value);
  
  if (Object.keys(missingValues).includes(valueType)) {
    return missingValues[valueType];  
  }
  
  const mapIndex = Array.prototype.findIndex.call(mapping, x => x.key === value);
  
  if (mapIndex >= 0) {
    return mapping[mapIndex].value;
  }
    
  if (valueType === 'String') {
    return value;
  }
  
  return JSON.stringify(value);
};


// EXPOSED: MODULE, PACKAGE
// *, [array<object:{ key$*, value$string }>], [object:{ Undefined$number, Null$number, ... }] => number
const toNumber = (value, mapping = [], missingValues = { Undefined: false, Null: false }) => {
  const valueType = whatType(value);
  
  if (Object.keys(missingValues).includes(valueType)) {
    return missingValues[valueType];  
  }
  
  const mapIndex = Array.prototype.findIndex.call(mapping, x => x.key === value);
  
  if (mapIndex >= 0) {
    return mapping[mapIndex].value;
  }
  
  return Number(value);
};


// EXPOSED: MODULE, PACKAGE
// *, [function<* => boolean], [object:{ Undefined$boolean, Null$boolean, ... }] => boolean
const toBoolean = (value, test = Boolean, missingValues = { Undefined: false, Null: false }) => {
  const valueType = whatType(value);
  
  if (Object.keys(missingValues).includes(valueType)) {
    return missingValues[valueType];  
  }
  
  if (valueType === 'Boolean') {
    return value;
  }
  
  return test(value);
};


// EXPOSED: MODULE, PACKAGE
// *, [function<* => date], [object:{ Undefined$date, Null$date, ... }] => date
const toDate = (value, parser = x => new Date(x), missingValues = { Undefined: new Date(NaN), Null: new Date(NaN) }) => {
  const valueType = whatType(value);
  
  if (Object.keys(missingValues).includes(valueType)) {
    return missingValues[valueType];  
  }
  
  if (valueType === 'Date') {
    return value;
  }
  
  return parser(value);
};


// INTERNAL
// function => array, [**] => array
const toTypedArray = f => (arr, ...args) => arr.map(v => f(...[].concat(v, args)));


module.exports = {
  toString,
  toNumber,
  toBoolean,
  toDate,
  toStringArray: toTypedArray(toString),
  toNumberArray: toTypedArray(toNumber),
  toBooleanArray: toTypedArray(toBoolean),
  toDateArray: toTypedArray(toDate),
};