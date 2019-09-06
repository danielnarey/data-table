import { typeCheck, types, extensions } from './runtime-checks';
import ops from './table-operations';

/**
 * % EXPOSED by MODULE as default, PACKAGE as size
 * # Returns a data table containing a random sample of *n* observations
 * # from *dt*
 * @dt ^Map:DataTable
 * @@ ^Object
 * $variables Number:Int<1>
 * $observations Number:Int<0>
 */
const size = async (dt) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);

  return {
    variables: _dt.size,
    observations: ops.nObs(_dt),
  };
};


export default size;
