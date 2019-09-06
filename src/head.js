import { typeCheck, types, extensions } from './runtime-checks';
import ops from './table-operations';


/**
 * % EXPOSED by MODULE as default, PACKAGE as head
 * # Returns a data table containing a the first *n* observations
 * # from *dt*
 * @dt ^Map:DataTable
 * @n=5 ^Number:Int<1>
 * @@ ^Map:DataTable
 */
const head = async (dt, n = 5) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.isDataTable);
  const _n = await typeCheck(2, n, types.Number, extensions.Int(1));

  return ops.mapValues(
    _dt,
    x => x.slice(0, _n),
  );
};


export default head;
