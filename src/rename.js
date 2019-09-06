import { typeCheck, types, extensions } from './runtime-checks';
import ops from './table-operations';


/**
 * % EXPOSED by MODULE as default, PACKAGE as rename
 * # Returns a new data table where the variables of *dt* have been renamed
 * # according to *mapping*.
 * @dt ^Map:DataTable
 * @mapping ^Map<String;String;1>
 * @@ ^Map:DataTable
 */
const rename = async (dt, mapping) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.isDataTable);
  const _mapping = await typeCheck(2, mapping, types.Map, extensions.hasSize(1));
  
  return ops.mapKeys(
    _dt,
    k => mapping.get(k), 
  );
};


export default rename;
