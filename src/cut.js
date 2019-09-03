import { typeCheck, types, extensions } from './runtime-checks';
import arr from './arr';
import drop from './drop';
import values from './values';


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
  const _cutter = await typeCheck(3, cutter, types.Function);
  const _values = await values(dt, varName);
  const _initial = await drop(dt, [varName]);

  const newValues = arr.map(_values, _cutter);
  const newVars = [...newValues[0].keys()];
  
  return arr.reduce(
    newVars,
    (a, k) => a.set(k, arr.map(newValues, x => x.get(k))),
    _initial,
  );
};


export default cut;
