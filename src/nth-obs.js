import { typeCheck, types, extensions } from './runtime-checks';
import arr from './arr';


/**
 * % EXPOSED by MODULE as default, PACKAGE as nthObs
 * # Returns a Map containing the value of each variable at observation *n*
 * @dt ^Map:DataTable
 * @n ^Number:Int<0>
 * @@ ^Map<String;*>
 */
const nthObs = async (dt, n) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  const _n = await typeCheck(2, n, types.Number, extensions.Int(0));

  return arr.reduce(
    [..._dt.keys()],
    (a, k) => a.set(k, _dt.get(k)[_n]),
    new Map(),
  );
};


export default nthObs;
