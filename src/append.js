import { typeCheck, types, extensions } from './runtime-checks';
import map2 from './map2';


/**
 * % EXPOSED by MODULE as default, PACKAGE as append
 * # For each variable name shared by *dt1* and *dt2*, append the value array 
 * # in *dt2* to the end of the value array in *dt1* and return the result as 
 * # a new data table or Map. See *map2* for further implementation details.
 * @dt1 ^Map:DataTable
 * @dt2 ^Map:DataTable
 * @@ ^Map<String;Array|TypedArray>
 */
const append = (dt1, dt2) => map2(
  dt1, 
  dt2, 
  Array.prototype.concat,
);


export default append;
