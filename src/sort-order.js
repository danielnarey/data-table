import { typeCheck, types, extensions } from './runtime-checks';
import indexes from './indexes';
import values from './values';


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
  const _compare = await typeCheck(3, compare, types.Function);
  const _indexes = await indexes(dt);
  const _values = await values(dt, varName);
  
  return _indexes.sort((i, j) => _compare(_values[i], _values[j]));
};


export default sortOrder;
