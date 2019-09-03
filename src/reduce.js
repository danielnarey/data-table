import { typeCheck, types, extensions } from './runtime-checks';


/**
 * % EXPOSED by MODULE as default, PACKAGE as reduce
 * # Apply a reducer over the value arrays in *dt*, returning the accumulated
 * # result. If *varNames* is supplied, the reducer will only be applied over
 * # the variables listed.
 * @dt ^Map:DataTable
 * @r ^Function<*, Array|TypedArray => *>
 * @initial ^*
 * @varNames=null [^Array<String>]
 * @@ ^*
 */
 const reduce = async (dt, r, initial, varNames = null) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  const _r = await typeCheck(2, r, types.Function);
  const _initial = await initial;
  
  const _varNames = (
    !varNames 
      ? [..._dt.keys()] 
      : await typeCheck(4, varNames, types.StringArray)
  );

  const iterator = (a, i) => {
    if (i >= _varNames.length) {
      return a;
    }
    
    return iterator(_r(a, _dt.get(_varNames[i]), _varNames[i]), i + 1);
  }

  return iterator(initial, 0);
};


export default reduce;
