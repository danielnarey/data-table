const { whatType } = require('./type-check-sync');

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
}


toNumber

toBoolean

toDateTime
