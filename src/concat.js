import { typeCheck, types, extensions } from './runtime-checks';
import arr from './arr';
import ops from './table-operations';


/**
 * % EXPOSED by MODULE as default, PACKAGE as concat
 * # Concatinate an array of data tables into a single data table, prefixing
 * # all variable names with a table name followed by *separator*. If
 * # *tableNames* is not provided, names will be assigned as `table0`,
 * # `table1`, and so on.  
 * @dtArray ^Array<Map:DataTable>
 * @tableNames=[] ^Array<String>
 * @separator='$' ^String
 * @@ ^Map:DataTable
 */
const concat = async (dtArray, tableNames = [], separator = '$') => {
  const _dtArray = await typeCheck(1, dtArray, types.Array, extensions.isDataTableArray);
  const _tableNames = await typeCheck(2, tableNames, types.StringArray);
  const _separator = await typeCheck(3, separator, types.String);
  
  if (!arr.every(_dtArray, x => ops.nObs(x) === ops.nObs(_dtArray[0]))) {
    throw new Error(
      'Concat failed because the data tables do not have the same number of observations (i.e., arrays are not all of the same length).'
    );
  }
  
  const reducer = (a, k, i) => {
    const prefix = (
      i < _tableNames.length
        ? _tableNames[i] 
        : `table${i}`
    );
    
    return new Map([
      ...a, 
      ...ops.mapKeys(k, (varName) => `${prefix}${_separator}${varName}`),
    ]); 
  };
  
  return arr.reduce(
    _dtArray, 
    reducer,
    new Map(),
  );
};


export default concat;
