import { typeCheck, types, extensions } from './runtime-checks';
import arr from './arr';


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
  const _dt = await typeCheck(1, dt, types.Map, extensions.isDataTable);
  const _varName = await typeCheck(2, varName, types.String);
  const _test = await typeCheck(3, test, types.Function);
  
  const out = [];
  
  arr.forEach(_dt.get(_varName), (x, i) => {
    if (_test(x)) {
      out.push(i);
    }
  });
  
  return Uint32Array.from(out);
};


export default whichObs;
