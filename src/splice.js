import { typeCheck, types, extensions } from './runtime-checks';
import arr from './arr';
import drop from './drop';
import indexes from './indexes';


/**
 * % EXPOSED by MODULE as default, PACKAGE as splice
 * # For each observation, splice the parallel values of *varNames* as
 * # specified by *splicer*, returning a new data table with *newName* 
 * # replacing *varNames*. If *newName* is not specified, the default is to 
 * # join *varNames* with a `:` separator.
 * @dt ^Map:DataTable
 * @varNames ^Array<String>
 * @splicer ^Function<Map<String;*> => *>
 * @newName=null ^String
 * @@ ^Map:DataTable
 */
const splice = async (dt, varNames, splicer, newName = null) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  const _varNames = await typeCheck(2, varNames, types.StringArray, extensions.hasLength(2));
  const _splicer = await typeCheck(3, splicer, types.Function);
  
  const _newName = (
    !newName 
      ? _varNames.join(':')
      : await typeCheck(4, newName, types.String)
  );
  
  const _indexes = await indexes(_dt);
  const _initial = await drop(_dt, varNames);
  
  const newValues = arr.map(
    _indexes, 
    x => _splicer(
      arr.reduce(
        _varNames,
        (a, k) => a.set(k, _dt.get(k)[_n]),
        new Map(),
      ),
    ),
  );
  
  return (new Map(_initial)).set(_newName, newValues); 
};


export default splice;
