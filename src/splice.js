import { typeCheck, types, extensions } from './runtime-checks';
import arr from './arr';
import ops from './table-operations';


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
  
  const newValues = arr.map(
    ops.indexes(_dt), 
    i => _splicer(ops.mapValues(x => x[i])),
  );
  
  return new Map(
    ...ops.drop(_dt, _varNames),
    [_newName, newValues],
  ); 
};


export default splice;
