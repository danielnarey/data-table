import { typeCheck, types, extensions } from './runtime-checks';
import arr from './arr';


/**
 * % EXPOSED by MODULE as default, PACKAGE as include
 * # Returns a new data table containing only the value arrays of *dt* for
 * # which *test* returns `true`. If no array passes the test, an empty
 * # Map is returned.
 * @dt ^Map:DataTable
 * @test ^Function<Array|TypedArray => Boolean>
 * @@ ^Map<String;Array|TypedArray>
 */
const include = async (dt, test) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.isDataTable);
  const _test = await typeCheck(2, test, types.Function);

  const varNames = arr.filter(
    [..._dt.keys()], 
    k => _test(_dt.get(k)),
  );

  return arr.reduce(
    varNames,
    (a, k) => a.set(k, _dt.get(k)),
    new Map(),
  );
};


export default include;
