//---CONVERT A SINGLE VALUE TO STRING, NUMBER, BOOLEAN, OR DATE---//

const { whatType } = require('./type-check-sync');


// EXPOSED: MODULE, PACKAGE
// *, [array<object:{ key$*, value$string }>], [object:{ Undefined$string, Null$string, ... }] => string
const toString = (value, mapping = [], missingValues = { Undefined: '', Null: '' }) => {
  const valueType = whatType(value);
  
  if (Object.keys(missingValues).includes(valueType)) {
    return missingValues[valueType];  
  }
  
  const mapIndex = mapping.findIndex(x => x.key === value);
  
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
  
  const mapIndex = mapping.findIndex(x => x.key === value);
  
  if (mapIndex >= 0) {
    return mapping[mapIndex].value;
  }
  
  return Number(value);
};


// EXPOSED: MODULE, PACKAGE
// *, [function<* => boolean], [object:{ Undefined$boolean, Null$boolean, ... }] => boolean
toBoolean = (value, test = Boolean, missingValues = { Undefined: false, Null: false }) => {
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
toDate = (value, parser = x => new Date(x), missingValues = { Undefined: new Date(NaN), Null: new Date(NaN) } => {
  const valueType = whatType(value);
  
  if (Object.keys(missingValues).includes(valueType)) {
    return missingValues[valueType];  
  }
  
  if (valueType === 'Date') {
    return value;
  }
  
  return parser(value);
};


module.exports = {
  toString,
  toNumber,
  toBoolean,
  toDate,
};