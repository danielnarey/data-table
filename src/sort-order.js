import { typeCheck, types, extensions } from './runtime-checks';
import obs from './table-operations';


/**
 * % EXPOSED by MODULE as default, PACKAGE as sortOrder
 * # Returns an Array representing the the sort order of indexes obtained by 
 * # using the *compare* function to sort the value array at *varName*.
 * @dt ^Map:DataTable
 * @varName ^String
 * @compare ^Function<*, * => Number>
 * @@ ^Array<Number:Int<0>>
 */
const sortOrder = async (dt, varName, compare) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.isDataTable);
  const _varName = await typeCheck(2, varNames, types.String);
  const _compare = await typeCheck(3, compare, types.Function);

  const indexes = obs.indexes(_dt);
  const values = _dt.get(_varName);
  
  return indexes.sort(
    (i, j) => _compare(values[i], values[j]),
  );
};


export default sortOrder;
