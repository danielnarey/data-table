import { typeCheck, types, extensions } from './runtime-checks';
import ops from './table-operations';

/**
 * % EXPOSED by MODULE as default, PACKAGE as indexes
 * # Returns an array containing the sequence of indexes from 0 to one less 
 * # than the size of *dt*.
 * @dt ^Map:DataTable
 * @@ ^TypedArray:Uint32Array
 */
const indexes = async (dt) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.isDataTable);
  
  return ops.indexes(_dt);
};


export default indexes;
