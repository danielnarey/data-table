import { typeCheck, types, extensions } from './runtime-checks';
import arr from './arr';


/**
 * % EXPOSED by MODULE as default, PACKAGE as map
 * # Apply a function to each value array in *dt*, returning the result as a 
 * # new data table or Map. If *varNames* is supplied, the transformation 
 * # will only be applied on the variables listed, leaving the remaining value 
 * # arrays unmodified in the returned data table or Map.
 * @dt ^Map:DataTable
 * @f ^Function<Array|TypedArray => *>
 * @varNames=null [^Array<String>]
 * @@ ^Map:<String;*>
 */
 const map = async (dt, f, varNames = null) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  const _f = await typeCheck(2, f, types.Function);
  
  const _varNames = (
    !varNames 
      ? [..._dt.keys()] 
      : await typeCheck(3, varNames, types.StringArray)
  );

  return arr.reduce(
    _varNames,
    (a, k) => a.set(k, _f(a.get(k))),
    new Map(_dt),
  );
};


export default map;
