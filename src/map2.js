import { typeCheck, types, extensions } from './runtime-checks';
import arr from './arr';


/**
 * % EXPOSED by MODULE as default, PACKAGE as map2
 * # Apply a function on the corresponding value arrays in *dt1* and *dt2*,
 * # returning the result as a new data table or Map. By default, the function
 * # is applied over every variable name that exists as a key in both *dt1* 
 * # and *dt2*, dropping unmatched *dt2* keys in the returned data table or 
 * # Map. If *varNames* is supplied, the transformation will only be 
 * # applied on the variables listed, leaving remaining *dt1* value arrays
 * # unmodified in the returned data table or Map. 
 * @dt1 ^Map:DataTable
 * @dt2 ^Map:DataTable
 * @f ^Function<Array|TypedArray => *>
 * @varNames=null [^Array<String>]
 * @@ ^Map:<String;*>
 */
 const map2 = async (dt1, dt2, f, varNames = null) => {
  const _dt1 = await typeCheck(1, dt1, types.Map, extensions.isDataTable);
  const _dt2 = await typeCheck(2, dt2, types.Map, extensions.isDataTable);
  const _f = await typeCheck(3, f, types.Function);
  
  const _varNames = (
    !varNames 
      ? arr.filter([..._dt1.keys()], x => _dt2.has(x)) 
      : await typeCheck(4, varNames, types.StringArray)
  );

  return arr.reduce(
    _varNames,
    (a, k) => a.set(k, _f(a.get(k), b.get(k))),
    new Map(_dt1),
  );
};


export default map2;
