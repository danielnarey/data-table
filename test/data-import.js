import path from 'path';
import test from 'ava';
import dt from '../src/data-import';


const array = [
  { var1: 'a', var2: 'zz', var3: 1, var4: 0.1, var5: true },
  { var1: 'b', var2: 'yy', var3: 2, var4: 0.1, var5: true },
  { var1: 'c', var2: 'xx', var3: 3, var4: 0.2, var5: true },
  { var1: 'd', var2: 'ww', var3: 4, var4: 0.2, var5: false },
  { var1: 'e', var2: 'vv', var3: 5, var4: 0.3, var5: false },
];

const pArray = Promise.resolve(array);

const table = {
  var1: ['a', 'b', 'c', 'd', 'e'],
  var2: ['zz', 'yy', 'xx', 'ww', 'vv'],
  var3: [1, 2, 3, 4, 5],
  var4: [0.1, 0.1, 0.2, 0.2, 0.3],
  var5: [true, true, true, false, false],
};

const csvPath = path.join(__dirname, './data/co2-concentration.csv');

const csvUrl = 'https://raw.githubusercontent.com/vega/vega-datasets/master/data/co2-concentration.csv';

const csvPreview50 = 'Date,CO2\n1958-03-01,315.7\n1958-04-01,317.46\n1958-0';

const jsonPath = path.join(__dirname, './data/driving.json');

const jsonUrl = 'https://raw.githubusercontent.com/vega/vega-datasets/master/data/driving.json';

const jsonPreview50 = '[\n  {"side": "left", "year": 1956, "miles": 3675, '; 


test('fromArray', async (t) => {
  t.deepEqual(await dt.fromArray(array), table);
  t.deepEqual(await dt.fromArray(pArray), table);
});

test('previewDataFile', async (t) => {
  t.deepEqual(await dt.previewDataFile(csvPath, 50), csvPreview50);
  t.deepEqual(await dt.previewDataFile(jsonPath, 50), jsonPreview50);
});

test('previewDataUrl', async (t) => {
  t.deepEqual(await dt.previewDataUrl(csvUrl, 50), csvPreview50);
  t.deepEqual(await dt.previewDataUrl(jsonUrl, 50), jsonPreview50);
});
