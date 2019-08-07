import test from 'ava';
import dt from '../src/data-transform';
import { fromArray } from '../src/data-import';


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


test('fromArray', async (t) => {
  t.deepEqual(await fromArray(array), table);
  t.deepEqual(await fromArray(pArray), table);
};