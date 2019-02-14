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


// EXPOSED

// Type checking

const isDataTable = async (promise) => {
  let dt;

  try {
    dt = await promise;
  } catch (error) {
    console.log(error);
  }

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

  return table;
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


// Viewing, sampling, and summarizing data

const head = async (promise, n = 5) => {
  const obj = {};

  try {
    const dt = await promise;
    const validated = await isDataTable(dt);

    if (!validated) {
      throw new TypeError('Expected a data table or a promise resolving to a data table.');
    }

    const keys = Object.keys(dt);

    keys.forEach((k) => {
      obj[k] = dt[k].slice(0, n);
    });
  } catch (error) {
    console.log(error);
  }

  return obj;
};


const variables = async (promise) => {
  let dt;

  try {
    dt = await promise;
    const validated = await isDataTable(dt);

    if (!validated) {
      throw new TypeError('Expected a data table or a promise resolving to a data table.');
    }
  } catch (error) {
    console.log(error);
  }

  return Object.keys(dt);
};


const size = async (promise) => {
  let obj;

  try {
    const dt = await promise;
    const validated = await isDataTable(dt);

    if (!validated) {
      throw new TypeError('Expected a data table or a promise resolving to a data table.');
    }

    const keys = Object.keys(dt);

    obj = {
      variables: keys.length,
      observations: dt[keys[0]].length,
    };
  } catch (error) {
    console.log(error);
  }

  return obj;
};


const sample = async (promise, n) => {
  const obj = {};

  try {
    const dt = await promise;
    const validated = await isDataTable(dt);

    if (!validated) {
      throw new TypeError('Expected a data table or a promise resolving to a data table.');
    }

    const keys = Object.keys(dt);
    const { observations } = await size(dt);
    const selected = stats.sample([...Array(observations).keys()], n);

    keys.forEach((k) => {
      obj[k] = dt[k].filter((c, i) => selected.includes(i));
    });
  } catch (error) {
    console.log(error);
  }

  return obj;
};


// Working with promises

const apply = async (promise, f, ...args) => {
  const dt = await promise;
  const validated = await isDataTable(dt);

  if (!validated) {
    throw new TypeError('Expected a data table or a promise resolving to a data table.');
  }

  return f(...[].concat(dt, args));
};


const apply2 = async (p1, p2, f, ...args) => {
  const dt1 = await p1;
  const dt2 = await p2;
  const validated2 = await isDataTable(dt2);

  if (!(await isDataTable(dt1))) {
    throw new TypeError('First argument: Expected a data table or a promise resolving to a data table.');
  }

  if (!validated2) {
    throw new TypeError('Second argument: Expected a data table or a promise resolving to a data table.');
  }

  return f(...[].concat(dt1, dt2, args));
};


const assign = (dt, update) => apply2(
  dt,
  update,
  (a, b) => Object.assign({}, a, b),
);


const map = async (dt, vars, f) => {
  if (whatType(vars) !== 'String' && whatType(vars) !== 'Array') {
    throw new TypeError('Second argument: Expected a variable name (string) or array of variable names.');
  }

  if (whatType(f) !== 'Function') {
    throw new TypeError('Third argument: Expected a function.');
  }

  const mapTable = t => [].concat(vars).map(k => t[k].map(f));

  return assign(dt, apply(dt, mapTable));
};


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
  head,
  size,
  // describe, - like pandas function
  variables,
  // observations, - returns array value of key
  // select, - drop variables not selected
  assign,
  // filter,
  sample,
  // arrange, - reorder indexes
  map,
  // reduce, - example: combining m d y min sec to datetime
  // aggregate,
  // summarize, - supply summary function for each key
  // spread,
  // gather,
  // display, - pretty print table
  // outputJsonArray,
  // outputJsonTable,
};
