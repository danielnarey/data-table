const fs = require('fs-extra');
const got = require('got');
const neatCsv = require('neat-csv');
const stats = require('simple-statistics');


// INTERNAL

const whatType = (value) => {
  if (value === undefined) {
    return 'Undefined';
  }

  if (value === null) {
    return 'Null';
  }

  return Object.prototype.toString.call(value).slice(8, -1);
};


const typeError1 = expected => new TypeError(`First argument: Expected ${expected}.`);


const typeError2 = expected => new TypeError(`Second argument: Expected ${expected}.`);


const typeError3 = expected => new TypeError(`Third argument: Expected ${expected}.`);


// EXPOSED

// Type checking

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


// Working with promises

const apply = async (dt, f, ...args) => {
  if (!(await isDataTable(dt))) {
    throw typeError1('a data table or a promise resolving to a data table');
  }

  return f(...[].concat(await dt, args));
};


const apply2 = async (dt1, dt2, f, ...args) => {
  if (!(await isDataTable(dt1))) {
    throw typeError1('a data table or a promise resolving to a data table');
  }

  if (!(await isDataTable(dt2))) {
    throw typeError2('a data table or a promise resolving to a data table');
  }

  return f(...[].concat(await dt1, await dt2, args));
};


// Functions on data tables

const assign = async (dt, update) => {
  const f = (a, b) => Object.assign({}, a, b);
  const combined = await apply2(dt, update, f);
  
  if (!(await isDataTable(combined))) {
    throw new Error('Assign failed because the two data tables do not have the same number of observations (i.e., arrays are not of the same length).');
  }
  
  return combined;
};


const mapVars = (dt, varNames, f) => {
  if (whatType(varNames) !== 'Array') {
    throw typeError2('an array of variable names');
  }

  if (whatType(f) !== 'Function') {
    throw typeError3('a function');
  }

  const r = t => (a, k) => Object.assign({}, a, { [k]: f(t[k]) });
  const ft = t => [].concat(varNames).reduce(r(t), {});

  return assign(dt, apply(dt, ft));
};


const mapValues = (dt, varNames, f) => {
  if (whatType(varNames) !== 'Array') {
    throw typeError2('an array of variable names');
  }

  if (whatType(f) !== 'Function') {
    throw typeError3('a function');
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
    throw typeError2('a variable name (string)');
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
