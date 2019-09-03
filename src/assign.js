import { typeCheck, types, extensions } from './runtime-checks';
import arr from './arr';
import size from './size';


/**
 * % EXPOSED by MODULE as default, PACKAGE as assign
 * # Assign to *dt1* all of the named variables (key-value pairs) in *dt2*
 * # and return the result. For variables with matching names, the *dt1*
 * # value array will be replaced by the *dt2* value array. 
 * @dt1 ^Map:DataTable
 * @dt2 ^Map:DataTable
 * @@ ^Map:DataTable
 */
const assign = async (dt1, dt2) => {
  const _dt1 = await typeCheck(1, dt1, types.Map, extensions.isDataTable);
  const _dt2 = await typeCheck(2, dt2, types.Map, extensions.isDataTable);
  
  if (size(_dt1).observations !== size(_dt2).observations) {
    throw new Error('Assign failed because the two data tables do not have the same number of observations (i.e., arrays are not all of the same length).');
  }
  
  return arr.reduce(
    [..._dt2.keys()],
    (a, k) => a.set(k, _dt2.get(k)),
    new Map(_dt1),
  );
};


export default assign;
