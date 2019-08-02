import test from 'ava';
import check from '../src/type-checking';

// primitive test values
const str = 'apple';
const num = 1.1;
const bool = true;
const func = () => 'apple';
const obj = { a: 'apple' };
const arr = ['apple', 1.1, true];
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

// typed array test values
const mixedArray = ['apple', 1.1, true];
const strArray = ['apple', 'orange', 'pear'];
const numArray = [1.1, 1.2, 1.3];
const boolArray = [true, true, false];
const funcArray = [() => 'apple', (n) => 1.1 + n, (b) => !b];
const emptyArray = [];

// promised typed array test values
const pMixedArray = Promise.resolve(mixedArray);
const pStrArray = Promise.resolve(strArray);
const pNumArray = Promise.resolve(numArray);
const pBoolArray = Promise.resolve(boolArray);
const pFuncArray = Promise.resolve(funcArray);
const pEmptyArray = Promise.resolve(emptyArray);


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
  t.false(await check.isString(pReject));
});


test('isNumber', async (t) => {
  t.true(await check.isNumber(num));
  t.true(await check.isNumber(pNum));
  
  t.false(await check.isNumber(str));
  t.false(await check.isNumber(pStr));
  t.false(await check.isNumber(bool));
  t.false(await check.isNumber(pBool));
  t.false(await check.isNumber(func));
  t.false(await check.isNumber(pFunc));
  t.false(await check.isNumber(obj));
  t.false(await check.isNumber(pObj));
  t.false(await check.isNumber(arr));
  t.false(await check.isNumber(pArr));
  t.false(await check.isNumber(nll));
  t.false(await check.isNumber(pNll));
  t.false(await check.isNumber(undef));
  t.false(await check.isNumber(pUndef));
  t.false(await check.isNumber(pReject));
});


test('isBoolean', async (t) => {
  t.true(await check.isBoolean(bool));
  t.true(await check.isBoolean(pBool));
  
  t.false(await check.isBoolean(str));
  t.false(await check.isBoolean(pStr));
  t.false(await check.isBoolean(num));
  t.false(await check.isBoolean(pNum));
  t.false(await check.isBoolean(func));
  t.false(await check.isBoolean(pFunc));
  t.false(await check.isBoolean(obj));
  t.false(await check.isBoolean(pObj));
  t.false(await check.isBoolean(arr));
  t.false(await check.isBoolean(pArr));
  t.false(await check.isBoolean(nll));
  t.false(await check.isBoolean(pNll));
  t.false(await check.isBoolean(undef));
  t.false(await check.isBoolean(pUndef));
  t.false(await check.isBoolean(pReject));
});


test('isFunction', async (t) => {
  t.true(await check.isFunction(func));
  t.true(await check.isFunction(pFunc));
  
  t.false(await check.isFunction(str));
  t.false(await check.isFunction(pStr));
  t.false(await check.isFunction(num));
  t.false(await check.isFunction(pNum));
  t.false(await check.isFunction(bool));
  t.false(await check.isFunction(pBool));
  t.false(await check.isFunction(obj));
  t.false(await check.isFunction(pObj));
  t.false(await check.isFunction(arr));
  t.false(await check.isFunction(pArr));
  t.false(await check.isFunction(nll));
  t.false(await check.isFunction(pNll));
  t.false(await check.isFunction(undef));
  t.false(await check.isFunction(pUndef));
  t.false(await check.isFunction(pReject));
});


test('isObject', async (t) => {
  t.true(await check.isObject(obj));
  t.true(await check.isObject(pObj));
  
  t.false(await check.isObject(str));
  t.false(await check.isObject(pStr));
  t.false(await check.isObject(num));
  t.false(await check.isObject(pNum));
  t.false(await check.isObject(bool));
  t.false(await check.isObject(pBool));
  t.false(await check.isObject(func));
  t.false(await check.isObject(pFunc));
  t.false(await check.isObject(arr));
  t.false(await check.isObject(pArr));
  t.false(await check.isObject(nll));
  t.false(await check.isObject(pNll));
  t.false(await check.isObject(undef));
  t.false(await check.isObject(pUndef));
  t.false(await check.isObject(pReject));
});


test('isArray', async (t) => {
  t.true(await check.isArray(arr));
  t.true(await check.isArray(pArr));
  
  t.false(await check.isArray(str));
  t.false(await check.isArray(pStr));
  t.false(await check.isArray(num));
  t.false(await check.isArray(pNum));
  t.false(await check.isArray(bool));
  t.false(await check.isArray(pBool));
  t.false(await check.isArray(func));
  t.false(await check.isArray(pFunc));
  t.false(await check.isArray(obj));
  t.false(await check.isArray(pObj));
  t.false(await check.isArray(nll));
  t.false(await check.isArray(pNll));
  t.false(await check.isArray(undef));
  t.false(await check.isArray(pUndef));
  t.false(await check.isArray(pReject));
});

test('isStringArray', async (t) => {
  t.true(await check.isStringArray(strArray));
  t.true(await check.isStringArray(pStrArray));
  
  t.false(await check.isStringArray(strArray.map(x => Promise.resolve(x))));
  
  t.true(await check.isStringArray(emptyArray));
  t.true(await check.isStringArray(pEmptyArray));
  
  t.false(await check.isStringArray(numArray));
  t.false(await check.isStringArray(pNumArray));
  t.false(await check.isStringArray(boolArray));
  t.false(await check.isStringArray(pBoolArray));
  t.false(await check.isStringArray(funcArray));
  t.false(await check.isStringArray(pFuncArray));
  t.false(await check.isStringArray(mixedArray));
  t.false(await check.isStringArray(pMixedArray));
  
  t.false(await check.isStringArray(obj));
  t.false(await check.isStringArray(pObj));
  t.false(await check.isStringArray(nll));
  t.false(await check.isStringArray(pNll));
  t.false(await check.isStringArray(undef));
  t.false(await check.isStringArray(pUndef));
  t.false(await check.isStringArray(pReject));
});


test('isNumberArray', async (t) => {
  t.true(await check.isNumberArray(numArray));
  t.true(await check.isNumberArray(pNumArray));
  
  t.false(await check.isNumberArray(numArray.map(x => Promise.resolve(x))));
  
  t.true(await check.isNumberArray(emptyArray));
  t.true(await check.isNumberArray(pEmptyArray));
  
  t.false(await check.isNumberArray(strArray));
  t.false(await check.isNumberArray(pStrArray));
  t.false(await check.isNumberArray(boolArray));
  t.false(await check.isNumberArray(pBoolArray));
  t.false(await check.isNumberArray(funcArray));
  t.false(await check.isNumberArray(pFuncArray));
  t.false(await check.isNumberArray(mixedArray));
  t.false(await check.isNumberArray(pMixedArray));
});


test('isBooleanArray', async (t) => {
  t.true(await check.isBooleanArray(boolArray));
  t.true(await check.isBooleanArray(pBoolArray));
  
  t.false(await check.isBooleanArray(boolArray.map(x => Promise.resolve(x))));
  
  t.true(await check.isBooleanArray(emptyArray));
  t.true(await check.isBooleanArray(pEmptyArray));
  
  t.false(await check.isBooleanArray(strArray));
  t.false(await check.isBooleanArray(pStrArray));
  t.false(await check.isBooleanArray(numArray));
  t.false(await check.isBooleanArray(pNumArray));
  t.false(await check.isBooleanArray(funcArray));
  t.false(await check.isBooleanArray(pFuncArray));
  t.false(await check.isBooleanArray(mixedArray));
  t.false(await check.isBooleanArray(pMixedArray));
});


test('isFunctionArray', async (t) => {
  t.true(await check.isFunctionArray(funcArray));
  t.true(await check.isFunctionArray(pFuncArray));
  
  t.false(await check.isFunctionArray(funcArray.map(x => Promise.resolve(x))));
  
  t.true(await check.isFunctionArray(emptyArray));
  t.true(await check.isFunctionArray(pEmptyArray));
  
  t.false(await check.isFunctionArray(strArray));
  t.false(await check.isFunctionArray(pStrArray));
  t.false(await check.isFunctionArray(numArray));
  t.false(await check.isFunctionArray(pNumArray));
  t.false(await check.isFunctionArray(boolArray));
  t.false(await check.isFunctionArray(pBoolArray));
  t.false(await check.isFunctionArray(mixedArray));
  t.false(await check.isFunctionArray(pMixedArray));
});

