const fs = require('fs-extra');
const got = require('got');
const neatCsv = require('neat-csv');
const stats = require('simple-statistics');


//---TYPE CHECKING (WITH PROMISED VALUES)---//

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


//---HANDLING TYPE ERRORS (WITH PROMISED VALUES)---//


// INTERNAL
// object:{NAME:{desc, test}}
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
// number:boundedInt<1;5>, promise<*>, object:{desc, test} => promise<*>  
const typeCheck = async (ordinal, promise, typeDef) => {
  if (!(await typeDef.test(promise))) {
    throw new TypeError(`${ordinalString(ordinal)} argument: Expected ${typeDef.desc}.`);
  }
  
  return await promise;
};


// INTERNAL
// number:boundedInt<1;5>, promise<*>, array<object:{desc, test}> => promise<*>
const typeCheckAny = async (ordinal, promise, typeDefs) => { 
  const iterator = async (i) => {
    if (i >= typeDefs.length) {
      const oneOf = typeDefs.map(td => td.desc).join(' *OR* ');
      throw new TypeError(`${ordinalString(ordinal)} argument: Expected ${oneOf}.`);
    }
    
    try {
      return await typeCheck(ordinal, promise, typeDefs[i]);
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


//---GETTING VARIABLE NAMES AND OBSERVED VALUES---//

// EXPOSED
// dataTable => array<string>
const variables = dt => apply(dt, Object.keys);


// EXPOSED
// dataTable, string => array
const values = (dt, varName) => {
  const _varName = await typeCheck(1, varName, types.string);

  return apply(dt, x => x[_varName]);
};


//---MAPPING AND CHAINING FUNCTIONS---//

// EXPOSED 
// dataTable, function<array => *> => object
const map = (dt, f) => {
  const _f = await typeCheck(2, f, types.function);
  const varNames = await variables(dt);

  const r = _dt => (a, k) => Object.assign({}, a, { [k]: _f(_dt[k]) });
  const ft = _dt => varNames.reduce(r(_dt), {});

  return apply(dt, ft);
};


// EXPOSED
// dataTable, array<function> => *
const pipe = (dt, fArray) => {
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


//---SUBSETTING, COMBINING, AND REPLACING VARIABLES---//

// EXPOSED
// dataTable, array<string> => dataTable
const select = async (dt, varNames) => {
  const _varNames = await typeCheck(2, varNames, types.stringArray);

  const r = _dt => (a, k) => Object.assign({}, a, { [k]: _dt[k] });
  const ft = _dt => _varNames.reduce(r(_dt), {});

  return apply(dt, ft);
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



const mapValues = (dt, varNames, f) => {
  if (whatType(varNames) !== 'Array') {
    throw typeError(2, 'an array of variable names');
  }

  if (whatType(f) !== 'Function') {
    throw typeError(3, 'a function');
  }

  const r = t => (a, k) => Object.assign({}, a, { [k]: t[k].map(f) });
  const ft = t => [].concat(varNames).reduce(r(t), {});

  return assign(dt, apply(dt, ft));
};





const head = async (dt, n = 5) => {
  if (whatType(n) !== 'Number') {
    throw typeError2('an integer');
  }

  const varNames = await variables(dt);
  const f = x => x.slice(0, n);

  return mapVars(dt, varNames, f);
};


const size = async (dt) => {
  const varNames = await variables(dt);
  const firstArray = await observations(dt, varNames[0]);

  return {
    variables: varNames.length,
    observations: firstArray.length,
  };
};


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


// Conversion and loading from data sources

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
  // summarize, - supply summary function for each key
  // spread,
  // gather,
  // display, - pretty print table
  // outputJsonArray,
  // outputJsonTable,
};
