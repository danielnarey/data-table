const fs = require('fs-extra');
const got = require('got');
const neatCsv = require('neat-csv');
const stats = require('simple-statistics');


// INTERNAL HELPERS

const whatType = (value) => {
  if (value === undefined) {
    return 'Undefined';
  }

  if (value === null) {
    return 'Null';
  }

  return Object.prototype.toString.call(value).slice(8, -1);
};


const isDataTable = async (promise) => {
  let table;

  try {
    table = await promise;
  } catch (error) {
    console.log(error);
  }

  if (whatType(table) !== 'Object') {
    return false;
  }

  const keys = Object.keys(table);

  if (keys.length === 0) {
    return false;
  }

  const valueTypes = keys.map(k => whatType(table[k]));

  if (!valueTypes.every(x => (x === 'Array'))) {
    return false;
  }

  const arrayLengths = keys.map(k => table[k].length);

  if (!arrayLengths.every(x => (x === arrayLengths[0]))) {
    return false;
  }

  return true;
};


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
  let table;

  try {
    const csvString = await fs.readFile(filepath);
    const jsArray = await neatCsv(csvString);

    table = await fromArray(jsArray);
  } catch (error) {
    console.log(error);
  }

  return table;
};


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


const fromJsonArray = async (filepath) => {
  let table;

  try {
    const jsArray = await fs.readJson(filepath);

    table = await fromArray(jsArray);
  } catch (error) {
    console.log(error);
  }

  return table;
};


const fromJsonTable = async (filepath) => {
  let table;

  try {
    table = await fs.readJson(filepath);
  } catch (error) {
    console.log(error);
  }

  return table;
};


const fromRemoteCsv = async (url) => {
  let table;

  try {
    const { body } = await got(url);
    const jsonArray = await neatCsv(body);

    table = await asDataTable(jsonArray);
  } catch (error) {
    console.log(error);
  }

  return table;
};


const fromRemoteJsonArray = async (url) => {
  let table;

  try {
    const { body } = await got(url, { json: true });

    table = await asDataTable(body);
  } catch (error) {
    console.log(error);
  }

  return table;
};


const fromRemoteJsonTable = async (url) => {
  let table;

  try {
    const { body } = await got(url, { json: true });

    table = body;
  } catch (error) {
    console.log(error);
  }

  return table;
};


const head = async (promise, n = 5) => {
  const obj = {};

  try {
    const table = await promise;
    const keys = Object.keys(table);

    keys.forEach((k) => {
      obj[k] = table[k].slice(0, n);
    });
  } catch (error) {
    console.log(error);
  }

  return obj;
};


const size = async (promise) => {
  let obj;

  try {
    const table = await promise;
    const keys = Object.keys(table);

    obj = {
      variables: keys.length,
      observations: table[keys[0]].length,
    };
  } catch (error) {
    console.log(error);
  }

  return obj;
};


const sample = async (promise, n) => {
  const obj = {};

  try {
    const table = await promise;
    const keys = Object.keys(table);
    const { observations } = await size(table);
    const selected = stats.sample([...Array(observations).keys()], n);

    keys.forEach((k) => {
      obj[k] = table[k].filter((c, i) => selected.includes(i));
    });
  } catch (error) {
    console.log(error);
  }

  return obj;
};


module.exports = {
  fromCsv,
  fromJsonArray,
  fromJsonTable,
  fromRemoteCsv,
  fromRemoteJsonArray,
  fromRemoteJsonTable,
  previewDataFile,
  previewRemoteData,
  head,
  size,
  sample,
};
