import { typeCheck, types, extensions } from './runtime-checks';
import arr from './arr';


/**
 * % EXPOSED by MODULE as default, PACKAGE as select
 * # Returns a new data table containing only the named variables of *dt* 
 * # that are listed in *varNames*.
 * @dt ^Map:DataTable
 * @varNames ^Array<String;1>
 * @@ ^Map:DataTable
 */
const select = async (dt, varNames) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.isDataTable);
  const _varNames = await typeCheck(2, varNames, types.StringArray, extensions.hasLength(1));
  
  return arr.reduce(
    _varNames,
    (a, k) => a.set(k, _dt.get(k)),
    new Map(),
  );
};


export default select;
