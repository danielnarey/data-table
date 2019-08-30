import { typeCheck, types, extensions } from './runtime-checks';


/**
 * % EXPOSED by MODULE as default, PACKAGE as values
 * # Returns an array containing all of the values of *varName* in *dt* (in
 * # the current observation order).
 * @dt ^Map:DataTable
 * @varName ^String
 * @@ ^Array|TypedArray
 */
const values = async (dt, varName) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  const _varName = await typeCheck(2, varName, types.String);

  return _dt.get(_varName);
};


export default values;
