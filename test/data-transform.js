import test from 'ava';
import checkSync from '../src/type-check-sync';
import dt from '../src/data-transform';

const table = {
  var1: ['a', 'b', 'c', 'd', 'e'],
  var2: ['zz', 'yy', 'xx', 'ww', 'vv'],
  var3: [1, 2, 3, 4, 5],
  var4: [0.1, 0.1, 0.2, 0.2, 0.3],
  var5: [true, true, true, false, false],
};

const varNames = ['var1', 'var2', 'var3', 'var4', 'var5'];

const obs0 = {
  var1: 'a', 
  var2: 'zz', 
  var3: 1, 
  var4: 0.1, 
  var5: true
};

const pTable = Promise.resolve(table);

const table2 = {
  var3: [10, 20, 30, 40, 50],
  var5: [false, false, false, true, false],
};

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


test('pipe', async (t) => {
  const fArray = [
    Object.values,
    x => x[0],
    x => x[0],    
  ];
  
  t.deepEqual(await dt.pipe(table, fArray), 'a');
  t.deepEqual(await dt.pipe(pTable, fArray), 'a');
});


test('map', async (t) => {
  t.deepEqual(await dt.map(table, x => x[0]), obs0);
  t.deepEqual(await dt.map(pTable, x => x[0]), obs0);
});


test('map2', async (t) => {
  const f = (a, b) => a.length + b.length;
  
  t.deepEqual(await dt.map2(table, table2, f), { var3: 10, var5: 10 });
  t.deepEqual(await dt.map2(pTable, pTable2, f), { var3: 10, var5: 10 });
});


test('reduce', async (t) => {
  const f = (a, k, i) => Object.assign({}, a, { [i]: k[0] });
   
  t.deepEqual(await dt.reduce(table, f, {}), obs0);
  t.deepEqual(await dt.reduce(pTable, f, {}), obs0);
});


test('size', async (t) => {
  t.deepEqual(await dt.size(table), { variables: 5, observations: 5 });
  t.deepEqual(await dt.size(pTable), { variables: 5, observations: 5 });
});


test('variables', async (t) => {
  t.deepEqual(await dt.variables(table), varNames);
  t.deepEqual(await dt.variables(pTable), varNames);
});


test('observation', async (t) => {
  t.deepEqual(await dt.observation(table, 0), obs0);
  t.deepEqual(await dt.observation(pTable, 0), obs0);
});


test('values', async (t) => {
  t.deepEqual(await dt.values(table, 'var1'), table.var1);
  t.deepEqual(await dt.values(pTable, 'var1'), table.var1);
});


test('unique', async (t) => {
  t.deepEqual(await dt.unique(table, 'var4'), [0.1, 0.2, 0.3]);
  t.deepEqual(await dt.unique(pTable, 'var4'), [0.1, 0.2, 0.3]);
});


test('select', async (t) => {
  t.deepEqual(await dt.select(table, ['var1', 'var3']), { var1: table.var1, var3: table.var3 });
  t.deepEqual(await dt.select(pTable, ['var1', 'var3']), { var1: table.var1, var3: table.var3 });
});


test('drop', async (t) => {
  t.deepEqual(await dt.drop(table, ['var2', 'var4', 'var5']), { var1: table.var1, var3: table.var3 });
  t.deepEqual(await dt.drop(pTable, ['var2', 'var4', 'var5']), { var1: table.var1, var3: table.var3 });
});


test('include', async (t) => {
  t.deepEqual(await dt.include(table, checkSync.isStringArray), { var1: table.var1, var2: table.var2 });
  t.deepEqual(await dt.include(pTable, checkSync.isStringArray), { var1: table.var1, var2: table.var2 });
});


test('assign', async (t) => {
  t.deepEqual(await dt.assign(table, table2), Object.assign({}, table, table2));
  t.deepEqual(await dt.assign(pTable, pTable2), Object.assign({}, table, table2));
  
  await t.throwsAsync(async () => await dt.assign(table, { var6: [1, 2] }));
});


test('concat', async (t) => {
  const expected = {
    'table0$var1': table.var1,
    'table0$var2': table.var2,
    'table0$var3': table.var3,
    'table0$var4': table.var4,
    'table0$var5': table.var5,
    'table1$var3': table2.var3,
    'table1$var5': table2.var5,
  };
  
  const expected2 = {
    'alpha_var1': table.var1,
    'alpha_var2': table.var2,
    'alpha_var3': table.var3,
    'alpha_var4': table.var4,
    'alpha_var5': table.var5,
    'beta_var3': table2.var3,
    'beta_var5': table2.var5,
  };
  
  t.deepEqual(await dt.concat([table, table2]), expected);
  t.deepEqual(await dt.concat([table, table2]), expected);
  
  t.deepEqual(await dt.concat([table, table2], ['alpha', 'beta'], '_'), expected2);
  t.deepEqual(await dt.concat([table, table2], ['alpha', 'beta'], '_'), expected2);
  
  await t.throwsAsync(async () => await dt.concat(table, { var6: [1, 2] }));
});


test('head', async (t) => {
  const expected = {
    var1: ['a', 'b'],
    var2: ['zz', 'yy'],
    var3: [1, 2],
    var4: [0.1, 0.1],
    var5: [true, true],
  };
  console.log(await dt.head(table, 2));
  t.deepEqual(await dt.head(table, 2), expected);
  t.deepEqual(await dt.head(pTable, 2), expected);
});


test('sample', async (t) => {
  const sampled1 = await dt.sample(table, 2);
  const sampled2 = await dt.sample(pTable, Promise.resolve(2));
  
  t.deepEqual(await dt.size(sampled1), { variables: 5, observations: 2 });
  t.deepEqual(await dt.size(sampled2), { variables: 5, observations: 2 });
});


test('filter', async (t) => {
  const expected = {
    var1: ['a', 'b', 'c'],
    var2: ['zz', 'yy', 'zz'],
    var3: [1, 2, 3],
    var4: [0.1, 0.1, 0.2],
    var5: [true, true, true],
  };
  
  t.deepEqual(await dt.filter(table, x => x.var5), expected);
  t.deepEqual(await dt.filter(pTable, x => x.var5), expected);
});
