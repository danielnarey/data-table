import test from 'ava';
import dt from '../src/data-transform';

const table = {
  var1: ['a', 'b', 'c', 'd', 'e'],
  var2: ['zz', 'yy', 'xx', 'ww', 'vv'],
  var3: [1, 2, 3, 4, 5],
  var4: [0.1, 0.2, 0.3, 0.4, 0.5],
  var5: [true, true, true, false, false],
};

const varNames = ['var1', 'var2', 'var3', 'var4', 'var5'];

const pTable = Promise.resolve(table);

const empty = {};

const pEmpty = Promise.resolve(empty);

const pReject = Promise.reject(new Error('Fail'));


test('apply', async (t) => {
  t.deepEqual(await dt.apply(table, Object.keys), varNames);
  t.deepEqual(await dt.apply(pTable, Object.keys), varNames);
  t.throwsAsync(() => await dt.apply(empty, Object.keys));
  t.throwsAsync(() => await dt.apply(pEmpty, Object.keys));
  t.throwsAsync(() => await dt.apply(pReject, Object.keys));
});