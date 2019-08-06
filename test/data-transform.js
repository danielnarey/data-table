import test from 'ava';
import dt from '../src/data-transform';

const table = {
  var1: ['a', 'b', 'c', 'd', 'e'],
  var2: ['zz', 'yy', 'xx', 'ww', 'vv'],
  var3: [1, 2, 3, 4, 5],
  var4: [0.1, 0.2, 0.3, 0.4, 0.5],
  var5: [true, true, true, false, false],
};

const table2 = {
  var3: [10, 20, 30, 40, 50],
  var5: [false, false, false, true, false],
};

const varNames = ['var1', 'var2', 'var3', 'var4', 'var5'];

const pTable = Promise.resolve(table);

const pTable2 = Promise.resolve(table2);

const empty = {};

const pEmpty = Promise.resolve(empty);

const pReject = () => Promise.reject(new Error('Fail'));


test('apply', async (t) => {
  t.deepEqual(await dt.apply(table, Object.keys), varNames);
  t.deepEqual(await dt.apply(pTable, Object.keys), varNames);
  
  await t.throwsAsync(async () => await dt.apply(empty, Object.keys));
  await t.throwsAsync(async () => await dt.apply(pEmpty, Object.keys));
  await t.throwsAsync(async () => await dt.apply(pReject, Object.keys));
  await t.throwsAsync(async () => await dt.apply(table, 'not a function'));
});


test('apply2', async (t) => {
  const f = (a, b, k) => Object.assign({}, a, b)[k];
  
  t.deepEqual(await dt.apply2(table, table2, f, 'var3'), table2.var3);
  t.deepEqual(await dt.apply2(pTable, pTable2, f, 'var3'), table2.var3);
});