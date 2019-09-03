import { typeCheck, types, extensions } from './runtime-checks';
import arr from './arr';
import values from './values';


/**
 * % EXPOSED by MODULE as default, PACKAGE as whichObs
 * # Returns an Array containing the indexes for which *test* on the value at
 * # *varName* returns `true`.
 * @dt ^Map:DataTable
 * @varName ^String
 * @test ^Function<* => Boolean>
 * @@ ^TypedArray:Uint32Array
 */
const whichObs = async (dt, varName, test) => {
  const _test = await typeCheck(3, test, types.Function);
  const _values = await values(dt, varName);
  const out = [];
  
  arr.forEach(_values, (x, i) => {
    if (_test(x)) {
      out.push(i);
    }
  });
  
  return Uint32Array.from(out);
};


export default whichObs;
