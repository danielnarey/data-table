const fs = require('fs-extra');
const got = require('got');
const neatCsv = require('neat-csv');
const stats = require('simple-statistics');


//---TYPE CHECKING WITH PROMISES---//

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
// [*] => promise<boolean>
const isPrimitive = type => async (promise) => {
  try {
    const value = await promise;
    return whatType(value) === type;
  } catch {
    return false;
  }
};


// INTERNAL
// [*] => promise<boolean>
const isRejected = async (promise) => {
  if (whatType(promise) !== 'Promise') {
    return false;
  }
  
  try {
    await promise;
    return false;
  } catch {
    return true;
  }
};


// INTERNAL
// [*] => promise<boolean>
const isTypedArray = type => async (promise) => {
  try {
    const array = await promise;
  
    if (whatType(array) !== 'Array') {
      return false;
    }
  
    return array.every(x => whatType(x) === type);
  } catch {
    return false;
  }
};


// EXPOSED
// [*] => promise<boolean>
const isString = isPrimitive('String');


// EXPOSED
// [*] => promise<boolean>
const isNumber = isPrimitive('Number');


// EXPOSED
// [*] => promise<boolean>
const isBoolean = isPrimitive('Boolean');


// EXPOSED
// [*] => promise<boolean>
const isStringArray = isTypedArray('String');


// EXPOSED
// [*] => promise<boolean>
const isNumberArray = isTypedArray('Number');


// EXPOSED
// [*] => promise<boolean>
const isBooleanArray = isTypedArray('Boolean');
 

// EXPOSED
// [*] => promise<boolean>
const isDataTable = async (promise) => {
  const dt = await promise;

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


//---HANDLING TYPE ERRORS (WITH PROMISES)---//


// INTERNAL
// object:{#:{desc$string, test$function<[*] => boolean>}}
const types = {
  string: {
    desc: 'a string or a promise resolving to a string',
    test: isString,
  },
  number: {
    desc: 'a number or a promise resolving to a number',
    test: isNumber,
  },
  boolean: {
    desc: 'a boolean or a promise resolving to a boolean',
    test: isBoolean,
  },
  function: {
    desc: 'a function or a promise resolving to a function',
    test: isFunction,
  },
  stringArray: {
    desc: 'a string array or a promise resolving to a string array',
    test: isStringArray,
  },
  numberArray: {
    desc: 'a number array or a promise resolving to a number array',
    test: isNumberArray,
  },
  booleanArray: {
    desc: 'a boolean array or a promise resolving to a boolean array',
    test: isBooleanArray,
  },
  dataTable: {
    desc: 'a data table or a promise resolving to a data table',
    test: isDataTable,
  },
};


// INTERNAL
// object:{#:{desc$string, test$function<[*] => boolean>}}
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
};


// INTERNAL 
// number:boundedInt<1;5> => string
const ordinalString = n => {
  if (whatType(n) !== 'Number' || n < 1 || n > 5) {
    throw new Error('Improper argument to `ordinalString` function: (number:boundedInt<1;5> => string);
  }

  return [
    'First',
    'Second',
    'Third',
    'Fourth',
    'Fifth',
  ][n - 1];
};
  

// INTERNAL
// number:boundedInt<1;5>, promise, object:{desc$string, test$function<[*] => boolean>}, [object:{desc$string, test$function<[*] => boolean>}] => promise
const typeCheck = async (ordinal, promise, typeDef, extended = null) => {
  if (!(await typeDef.test(promise))) {
    throw new TypeError(`${ordinalString(ordinal)} argument: Expected ${typeDef.desc}.`);
  }
  
  const value = await promise;

  if (extended && !(extended.test(value))) {
    throw new TypeError(`${ordinalString(ordinal)} argument: Expected ${extended.desc}.`);
  }
  
  return value;
};


// INTERNAL
// number:boundedInt<1;5>, promise, array<object:{desc$string, test$function<[*] => boolean>}, [array<object:{desc$string, test$function<[*] => boolean>}]> => promise
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


//---FUNCTION APPLICATION (WITH IMPLICIT PROMISE CHAINING)---//

// EXPOSED 
// dataTable, function<dataTable, [**] => *>, [**] => * 
const apply = async (dt, f, ...args) => {
  const _dt = await typeCheck(1, dt, types.dataTable);
  const _f = await typeCheck(2, f, types.function);
  
  return _f(...[].concat(_dt, args));
};


// EXPOSED 
// dataTable, dataTable, function<dataTable, dataTable, [**] => *>, [**] => *
const apply2 = async (dt1, dt2, f, ...args) => {
  const _dt1 = await typeCheck(1, dt1, types.dataTable);
  const _dt2 = await typeCheck(2, dt2, types.dataTable);
  const _f = await typeCheck(3, f, types.function);
  
  return _f(...[].concat(_dt1, _dt2, args));
};


//---HIGHER ORDER FUNCTIONS---//

// EXPOSED 
// dataTable, function<array => *> => object
const map = async (dt, f) => {
  const _f = await typeCheck(2, f, types.function);
  const varNames = await variables(dt);

  const r = obj => (a, k) => Object.assign({}, a, { [k]: _f(obj[k]) });
  const f = obj => varNames.reduce(r(obj), {});

  return apply(dt, f);
};


// EXPOSED
// dataTable, function<*, array, string>, * => *   
const reduce = async (dt, r, initial) => {

};


// EXPOSED
// dataTable, array<function> => *
const pipe = async (dt, fArray) => {
  const _dt = await typeCheck(1, dt, types.dataTable);
  const _fArray = await typeCheck(2, fArray, types.functionArray);

  const iterator = (lastResult, i) => {
    if (i >= _fArray.length) {
      return lastResult;
    }
    
    return iterator(apply(lastResult, _fArray[i]), i + 1);
  }

  return iterator(_dt, 0);
};


//---GETTING TABLE SIZE, VARIABLE NAMES, AND VALUE ARRAYS---//

// EXPOSED
// dataTable => object:{variables$number:int, observations$number:int}
const size = async (dt) => {
  const varNames = await variables(dt);
  const firstArray = await observations(dt, varNames[0]);

  return {
    variables: varNames.length,
    observations: firstArray.length,
  };
};


// EXPOSED
// dataTable => array<string>
const variables = dt => apply(dt, Object.keys);


// EXPOSED
// dataTable, string => array
const values = async (dt, varName) => {
  const _varName = await typeCheck(2, varName, types.string);

  return apply(dt, x => x[_varName]);
};


// EXPOSED
// dataTable, string => array
const unique = async (dt, varName) => {

};


// EXPOSED
// dataTable => object
const describe = async (dt) => {

};


//---SUBSETTING AND COMBINING VARIABLE SETS---//

// EXPOSED
// dataTable, array<string> => dataTable
const select = async (dt, varNames) => {
  const _varNames = await typeCheck(2, varNames, types.stringArray);

  const r = obj => (a, k) => Object.assign({}, a, { [k]: obj[k] });
  const f = obj => _varNames.reduce(r(obj), {});

  return apply(dt, f);
};


// EXPOSED
// dataTable, function<array => boolean> => dataTable
const include = async (dt, test) => {
  const _dt = await typeCheck(1, dt, types.dataTable);
  const _test = await typeCheck(2, test, types.function);

  const varNames = await variables(_dt);
  const included = varNames.filter(v => test(_dt[v]));

  return select(_dt, included);
};


// EXPOSED
// dataTable, dataTable => dataTable
const assign = async (dt1, dt2) => {
  const f = (a, b) => Object.assign({}, a, b);
  const combined = await apply2(dt1, dt2, f);
  
  if (!(await isDataTable(combined))) {
    throw new Error('Assign failed because the two data tables do not have the same number of observations (i.e., arrays are not of the same length).');
  }
  
  return combined;
};


// EXPOSED
// array<dataTable>, [array<string>], [string] => dataTable
const concat = async (dtArray, tableNames = [], separator = ':') => {
  const _dtArray = typeCheck(1, dtArray, types.dataTableArray);
  const _tableNames = typeCheck(2, tableNames, types.stringArray);
  const _separator = typeCheck(3, separator, types.string);
  
  const r1 = obj => (a, k, i) => {
    const prefix = (i < _tableNames.length) ? _tableNames[i] : `table-${i}`;
    return Object.assign({}, a, { [`${prefix}${_separator}${k}`]: obj[k] });
  };
  
  const r2 = (a, k) => {
    const prefixed = Object.keys(k).reduce(r1, {});
    return Object.assign({}, a, prefixed);
  };
  
  return _dtArray.reduce(r2, {});
};


//---SUBSETTING AND COMBINING OBSERVATION SETS---//

// EXPOSED
// dataTable, number:leftBoundedInt(1) => dataTable
const head = async (dt, n = 5) => {
  const _n = typeCheck(2, n, types.number, extensions.leftBoundedInt(1));

  return map(dt, x => x.slice(0, _n));
};


// EXPOSED
// dataTable, number:leftBoundedInt(1) => dataTable
const sample = async (dt, n) => {
  if (whatType(n) !== 'Number') {
    throw typeError2('an integer');
  }

  const varNames = await variables(dt);
  const firstArray = await observations(dt, varNames[0]);
  const selected = stats.sample([...firstArray.keys()], n);
  const f = x => x.filter((c, i) => selected.includes(i));

  return mapVars(dt, varNames, f);
};


// EXPOSED
// dataTable, function<object => boolean> => dataTable
const filter = async (dt, test) => {

};


// EXPOSED
// dataTable, dataTable => dataTable
const append = async (dt1, dt2) => {

};


//---REORDERING AND TRANSFORMING TABLES---//

// dataTable, function<object => number> => dataTable
const arrange = async (dt, compare) => {

};

const classify

const cut 

const splice

const spread

const gather

const aggregate



//---IMPORTING DATA AND CONVERTING TO TABLE FORMAT---//

const fromArray = jsArray => new Promise((resolve, reject) => {
  if (whatType(jsArray) !== 'Array') {
    reject(new TypeError(`Expected an Array but got a ${whatType(jsArray)}`));
  }

  const keys = Object.keys(jsArray[0]);

  const reducer = (a, c, i) => {
    const obj = a;

    keys.forEach((k) => {
      obj[k][i] = c[k];
    });

    return obj;
  };

  const initial = {};
  keys.forEach((k) => {
    initial[k] = [];
  });

  resolve(jsArray.reduce(reducer, initial));
});


const fromCsv = async (filepath) => {
  let dt;

  try {
    const csvString = await fs.readFile(filepath);
    const jsArray = await neatCsv(csvString);

    dt = await fromArray(jsArray);
    const validated = await isDataTable(dt);

    if (!validated) {
      throw new TypeError('File content cannot be converted to a data table.');
    }
  } catch (error) {
    console.log(error);
  }

  return dt;
};


const fromJsonArray = async (filepath) => {
  let dt;

  try {
    const jsArray = await fs.readJson(filepath);

    dt = await fromArray(jsArray);
    const validated = await isDataTable(dt);

    if (!validated) {
      throw new TypeError('File content cannot be converted to a data table.');
    }
  } catch (error) {
    console.log(error);
  }

  return dt;
};


const fromJsonTable = async (filepath) => {
  let dt;

  try {
    dt = await fs.readJson(filepath);
    const validated = await isDataTable(dt);

    if (!validated) {
      throw new TypeError('File content is not a valid data table.');
    }
  } catch (error) {
    console.log(error);
  }

  return dt;
};


const fromRemoteCsv = async (url) => {
  let dt;

  try {
    const { body } = await got(url);
    const jsArray = await neatCsv(body);

    dt = await fromArray(jsArray);
    const validated = await isDataTable(dt);

    if (!validated) {
      throw new TypeError('Response body cannot be converted to a data table.');
    }
  } catch (error) {
    console.log(error);
  }

  return dt;
};


const fromRemoteJsonArray = async (url) => {
  let dt;

  try {
    const { body } = await got(url, { json: true });

    dt = await fromArray(body);
    const validated = await isDataTable(dt);

    if (!validated) {
      throw new TypeError('Response body cannot be converted to a data table.');
    }
  } catch (error) {
    console.log(error);
  }

  return dt;
};


const fromRemoteJsonTable = async (url) => {
  let dt;

  try {
    const { body } = await got(url, { json: true });
    const validated = await isDataTable(body);

    if (!validated) {
      throw new TypeError('Response body is not a valid data table.');
    }

    dt = body;
  } catch (error) {
    console.log(error);
  }

  return dt;
};


// Previewing data sources

const previewDataFile = async (filepath, bytes = 500, encoding = 'utf8') => {
  let content;

  try {
    const fd = fs.openSync(filepath);
    const { buffer } = await fs.read(fd, Buffer.alloc(bytes), 0, bytes);

    content = buffer.toString(encoding);
  } catch (error) {
    console.log(error);
  }

  return content;
};


const previewRemoteData = (url, bytes = 500, encoding = 'utf8') => new Promise((resolve, reject) => {
  let content = '';
  let downloaded = 0;

  try {
    const stream = got(url, {
      resolveBodyOnly: true,
      responseType: 'buffer',
      stream: true,
    });

    stream.on('data', (chunk) => {
      content += chunk.toString(encoding, 0, bytes - downloaded);
      downloaded += chunk.length;
      if (downloaded >= bytes) {
        stream.destroy();
        resolve(content);
      }
    }).on('error', (error) => {
      reject(error);
    });
  } catch (error) {
    reject(error);
  }
});


//---PRINTING AND EXPORTING DATA---//

module.exports = {
  isDataTable,
  fromArray,
  fromCsv,
  fromJsonArray,
  fromJsonTable,
  fromRemoteCsv,
  fromRemoteJsonArray,
  fromRemoteJsonTable,
  previewDataFile,
  previewRemoteData,
  apply,
  apply2,
  mapVars,
  mapValues,
  head,
  size,
  // describe, - like pandas function
  variables,
  observations,
  // select, - drop variables not selected
  assign,
  // filter,
  sample,
  // arrange, - reorder indexes
  // reduce, - example: combining m d y min sec to datetime
  // aggregate,
  // spread,
  // gather,
  // display, - pretty print table
  // outputJsonArray,
  // outputJsonTable,
};
