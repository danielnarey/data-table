import arr$reduce from '@arr/reduce';
import stats from 'simple-statistics';
import { typeCheck, types, extensions } from './runtime-checks';
import indexes from './indexes';
import map from './map';


/**
 * % EXPOSED by MODULE as default, PACKAGE as sample
 * # Returns a data table containing a random sample of *n* observations
 * # from *dt*
 * @dt ^Map:DataTable
 * @n ^Number:Int<1>
 * @@ ^Map:DataTable
 */
const sample = async (dt, n) => {
  const _n = await typeCheck(2, n, types.Number, extensions.Int(1));
  const _indexes = await indexes(dt);

  const selected = stats.sample(_indexes, _n);

  const callback = x => arr$reduce(
    selected,
    (a, k, i) => a[i] = k,
    new x.constructor(selected.length),
  );

  return map(dt, callback);
};


export default sample;
