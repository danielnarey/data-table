import { typeCheck, types, extensions } from './runtime-checks';


/**
 * % EXPOSED by MODULE as default, PACKAGE as varNames
 * # Returns an array containing the names of all variables in *dt*
 * @dt ^Map:DataTable
 * @@ ^Array<String>
 */
const varNames = async (dt) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);

  return [..._dt.keys()];
};


export default varNames;
