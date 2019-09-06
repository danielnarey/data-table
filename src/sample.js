import { typeCheck, types, extensions } from './runtime-checks';
import arr from './arr';
import ops from './table-operations';
import stats from 'simple-statistics';
import indexes from './indexes';


/**
 * % EXPOSED by MODULE as default, PACKAGE as sample
 * # Returns a data table containing a random sample of *n* observations
 * # from *dt*
 * @dt ^Map:DataTable
 * @n ^Number:Int<1>
 * @@ ^Map:DataTable
 */
const sample = async (dt, n) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.isDataTable);
  const _n = await typeCheck(2, n, types.Number, extensions.Int(1));
  
  const _indexes = await indexes(dt);
  const selected = stats.sample(_indexes, _n);

  return ops.mapValues(
    _dt, 
    x => x.constructor.from(selected, i => x[i]),
  );
};


export default sample;
