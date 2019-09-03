import arr from './arr';
import map from './map';
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
  const order = await sortOrder(dt, varName, compare);

  return map(
    dt, 
    x => x.constructor.from(order, k => x[k]),
  );
};


export default arrange;
