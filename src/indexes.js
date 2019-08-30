import { typeCheck, types, extensions } from './runtime-checks';


/**
 * % EXPOSED by MODULE as default, PACKAGE as indexes
 * # Returns an array containing the index of each observation in *dt*,
 * # starting from 0 and increasing to `size(dt).observations - 1`.
 * @dt ^Map:DataTable
 * @@ ^Array<Number:Int<0>>
 */
const indexes = async (dt) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  
  return [..._dt.values().next().value.keys()];
};


export default indexes;
