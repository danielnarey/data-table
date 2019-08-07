//---IMPORTING DATA AND CONVERTING TO TABLE FORMAT---//

const fs = require('fs-extra');
const got = require('got');
const neatCsv = require('neat-csv');
const { typeCheck, types, extensions } = require('./type-errors');


//---CONVERTING A DATA ARRAY TO A DATA TABLE---//

// EXPOSED: MODULE, PACKAGE
// array<object>, [array<string>] => dataTable  
const fromArray = async (dataArray, varNames = null) => {
  const _dataArray = await typeCheck(1, dataArray, types.array);
  
  if (!varNames) {
    varNames = Object.keys(_dataArray[0]);
  }
  
  const r1 = index => (table, varName) => {
    table[varName][index] = _dataArray[index][varName];
    
    return table;
  };

  const r2 = (a, k, i) => varNames.reduce(r1(i), a);
  
  const initial = {};
  varNames.forEach(v => initial[v] = []);
  
  return _dataArray.reduce(r2, initial);
};


//---PREVIEWING A DATA SOURCE AS TEXT---//

// EXPOSED: MODULE, PACKAGE
// string:path, [number:int], [string] => string
const previewDataFile = async (filepath, bytes = 500, encoding = 'utf8') => {
  const _filepath = await typeCheck(1, filepath, types.string);
  const _bytes = await typeCheck(2, bytes, types.number, extensions.leftBoundedInt(1));
  const _encoding = await typeCheck(3, encoding, types.string);
  
  const fd = fs.openSync(_filepath);
  const { buffer } = await fs.read(fd, Buffer.alloc(_bytes), 0, _bytes);

  return buffer.toString(_encoding);
};


// EXPOSED: MODULE, PACKAGE
// string:url, [number:int], [string] => string
const previewDataUrl = async (url, bytes = 500, encoding = 'utf8') => {
  const _url = await typeCheck(1, url, types.string);
  const _bytes = await typeCheck(2, bytes, types.number, extensions.leftBoundedInt(1));
  const _encoding = await typeCheck(3, encoding, types.string);

  return new Promise((resolve, reject) => {
    try {
      const stream = got(_url, {
        resolveBodyOnly: true,
        responseType: 'buffer',
        stream: true,
      });
      
      let content = '';
      let downloaded = 0;
      
      stream.on('data', (chunk) => {
        content += chunk.toString(_encoding, 0, _bytes - downloaded);
        downloaded += chunk.length;
        if (downloaded >= _bytes) {
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
};


//---IMPORTING DATA FROM CSV---//

// EXPOSED: MODULE, PACKAGE
// string:path, [array<string>] => dataTable
const fromCsvFile = async (filepath, varNames = null) => {
  const _filepath = await typeCheck(1, filepath, types.string);
  const csvString = await fs.readFile(_filepath);
  const dataArray = await neatCsv(csvString);

  return fromArray(dataArray, varNames);
};


// EXPOSED: MODULE, PACKAGE
// string:path, [array<string>] => dataTable
const fromJsonFile = async (filepath, varNames = null) => {
  const _filepath = await typeCheck(1, filepath, types.string);
  const dataArray = await fs.readJson(_filepath);

  return fromArray(dataArray);
};


// EXPOSED: MODULE, PACKAGE
// string:path, [array<string>] => dataTable
const fromCsvUrl = async (url, varNames = null) => {
  const _url = await typeCheck(1, url, types.string);
  const { body } = await got(url);
  const dataArray = await neatCsv(body);

  return fromArray(dataArray);
};


//---IMPORTING DATA FROM JSON---//

// EXPOSED: MODULE, PACKAGE
// string:path, [array<string>] => dataTable
const fromJsonUrl = async (url, varNames = null) => {
  const _url = await typeCheck(1, url, types.string);
  const { body } = await got(url, { json: true });

  return fromArray(body);
};


module.exports = {
  fromArray,
  previewDataFile,
  previewDataUrl,
  fromCsvFile,
  fromCsvUrl,
  fromJsonFile,
  fromJsonUrl,
};
