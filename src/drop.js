import { typeCheck, types, extensions } from './runtime-checks';
import ops from './table-operations';


/**
 * % EXPOSED by MODULE as default, PACKAGE as drop
 * # Returns a new data table containing only the named variables of *dt*
 * # that are **not** listed in *varNames*.
 * @dt ^Map:DataTable
 * @varNames ^Array<String>
 * @@ ^Map:DataTable
 */
const drop = async (dt, varNames) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.isDataTable);
  const _varNames = await typeCheck(2, varNames, types.StringArray);
  
  return ops.drop(_dt, _varNames);
};


export default drop;
