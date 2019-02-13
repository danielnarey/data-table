const fs = require('fs-extra');
const got = require('got');
const neatCsv = require('neat-csv');
const stats = require('simple-statistics');


const asDataTable = async (jsonArray) => {
  let table;

  try {
    const keys = Object.keys(jsonArray[0]);

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

    table = jsonArray.reduce(reducer, initial);
  } catch (error) {
    console.log(error);
  }

  return table;
};


const fromCsv = async (filepath) => {
  let table;

  try {
    const csvString = await fs.readFile(filepath);
    const jsonArray = await neatCsv(csvString);

    table = await asDataTable(jsonArray);
  } catch (error) {
    console.log(error);
  }

  return table;
};


const fromJsonArray = async (filepath) => {
  let table;

  try {
    const jsonArray = await fs.readJson(filepath);

    table = await asDataTable(jsonArray);
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
    const length = await size(table);
    const selected = stats.sample([...Array(length).keys()], n);

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
  head,
  size,
  sample,
};
