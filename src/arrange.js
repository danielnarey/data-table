import { typeCheck, types, extensions } from './runtime-checks';
import arr from './arr';
import ops from './table-operations';
import sortOrder from './sort-order';


/**
 * % EXPOSED by MODULE as default, PACKAGE as arrange
 * # Returns a new data table with observations arranged in the order obtained 
 * # by using the *compare* function to sort the value array at *varName*.
 * @dt ^Map:DataTable
 * @varName ^String
 * @compare ^Function<*, * => Number>
 * @@ ^Map:DataTable
 */
const arrange = async (dt, varName, compare) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.isDataTable);

  const order = await sortOrder(dt, varName, compare);

  return ops.mapValues(
    _dt, 
    x => x.constructor.from(order, k => x[k]),
  );
};


export default arrange;
