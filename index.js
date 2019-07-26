const fs = require('fs-extra');
const got = require('got');
const neatCsv = require('neat-csv');
const stats = require('simple-statistics');


//---TYPE CHECKING---//

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
  const value = await promise;
  
  return whatType(value) === type;
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


// INTERNAL
// [*] => promise<boolean>
const isTypedArray = type => async (promise) => {
  const array = await promise;
  
  if (whatType(array) !== 'Array') {
    return false;
  }
  
  return array.every(x => whatType(x) === type);
};


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


// INTERNAL
// () => object
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
// number:boundedInt<1;5>, promise<*>, function<promise<*> => promise<boolean>>, string => promise<*>  
const typeCheck = async (ordinal, promise, typeDef) => {
  const ordinalString = ['First', 'Second', 'Third', 'Fourth', 'Fifth'][ordinal - 1];
  
  if (!(await typeDef.test(promise))) {
    throw new TypeError(`${ordinalString} argument: Expected ${typeDef.desc}.`);
  }
  
  return await promise;
};


//---FUNCTIONAL TRANSFORMS---//

const apply = async (promise, f, ...args) => {
  const dt = await typeCheck(1, promise, types.dataTable);
  
  return f(...[].concat(dt, args));
};


const apply2 = async (promise1, promise2, f, ...args) => {
  const dt1 = await typeCheck(1, promise1, types.dataTable);
  const dt2 = await typeCheck(2, promise2, types.dataTable);
  
  return f(...[].concat(dt1, dt2, args));
};


const assign = async (dt, update) => {
  const f = (a, b) => Object.assign({}, a, b);
  const combined = await apply2(dt, update, f);
  
  if (!(await isDataTable(combined))) {
    throw new Error('Assign failed because the two data tables do not have the same number of observations (i.e., arrays are not of the same length).');
  }
  
  return combined;
};


const mapVars = (dt, varNames, f) => {
  typeCheck(2, varNames, types.arrayString)
  if (whatType(varNames) !== 'Array') {
    throw typeError(2, 'an array of variable names');
  }

  if (whatType(f) !== 'Function') {
    throw typeError(3, 'a function');
  }

  const r = t => (a, k) => Object.assign({}, a, { [k]: f(t[k]) });
  const ft = t => [].concat(varNames).reduce(r(t), {});

  return assign(dt, apply(dt, ft));
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


const variables = (dt) => {
  const f = x => Object.keys(x);

  return apply(dt, f);
};


const values = (dt, varName) => {
  if (whatType(varName) !== 'String') {
    throw typeError(2, 'a variable name (string)');
  }

  const f = x => x[varName];

  return apply(dt, f);
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
