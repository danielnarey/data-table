import { typeCheck, types, extensions } from './runtime-checks';
import arr from './arr';


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
  
  return arr.reduce(
    [..._mapping.keys()],
    (a, k) => a.delete(k).set(_mapping.get(k), _dt.get(k)),
    new Map(_dt),
  );
};


export default rename;
