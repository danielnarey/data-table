import test from 'ava';
import check from '../src/type-checking';

// primitive test values
const str = 'apple';
const num = 1.1;
const bool = true;
const func = () => 'apple';
const obj = { a: 'apple' };
const arr = [ 'apple', 'orange', 'pear' ];
const nll = null;
const undef = {}.a;

// promised test values
const pStr = Promise.resolve(str);
const pNum = Promise.resolve(num);
const pBool = Promise.resolve(bool);
const pFunc = Promise.resolve(func);
const pObj = Promise.resolve(obj);
const pArr = Promise.resolve(arr);
const pNll = Promise.resolve(nll);
const pUndef = Promise.resolve(undef);
const pReject = Promise.reject(new Error('Fail'));

test('isString', async (t) => {
  t.true(await check.isString(str));
  t.true(await check.isString(pStr));
  
  t.false(await check.isString(num));
  t.false(await check.isString(pNum));
  t.false(await check.isString(bool));
  t.false(await check.isString(pBool));
  t.false(await check.isString(func));
  t.false(await check.isString(pFunc));
  t.false(await check.isString(obj));
  t.false(await check.isString(pObj));
  t.false(await check.isString(arr));
  t.false(await check.isString(pArr));
  t.false(await check.isString(nll));
  t.false(await check.isString(pNll));
  t.false(await check.isString(undef));
  t.false(await check.isString(pUndef));
  
  t.throwsAsync(() => check.isString(pReject));
});
