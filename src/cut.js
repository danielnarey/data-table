import { typeCheck, types, extensions } from './runtime-checks';
import arr from './arr';
import ops from './table-opertations';

/**
 * % EXPOSED by MODULE as default, PACKAGE as cut
 * # Cut each value of *varName* into several key-value pairs as specified by 
 * # *cutter*, returning a new data table with the assigned keys as new
 * # variables (replacing *varName*).
 * @dt ^Map:DataTable
 * @varName ^String
 * @cutter ^Function<* => Map<String;*>>
 * @@ ^Map:DataTable
 */
const cut = async (dt, varName, cutter) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.isDataTable);
  const _varName = await typeCheck(2, varName, types.String);
  const _cutter = await typeCheck(3, cutter, types.Function);

  const newValues = arr.map(_dt.get(_varName), _cutter);
  const newVars = [...newValues[0].keys()];
  
  return arr.reduce(
    newVars,
    (a, k) => a.set(k, arr.map(newValues, x => x.get(k))),
    ops.drop(_dt, _varName),
  );
};


export default cut;
