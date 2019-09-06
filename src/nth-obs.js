import { typeCheck, types, extensions } from './runtime-checks';
import ops from './table-operations';


/**
 * % EXPOSED by MODULE as default, PACKAGE as nthObs
 * # Returns a Map containing the value of each variable at observation *n*
 * @dt ^Map:DataTable
 * @n ^Number:Int<0>
 * @@ ^Map<String;*>
 */
const nthObs = async (dt, n) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.isDataTable);
  const _n = await typeCheck(2, n, types.Number, extensions.isInt(0));

  return ops.mapValues(
    _dt,
    (x) => x[_n],
  );
};


export default nthObs;
