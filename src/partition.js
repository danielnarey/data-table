import { typeCheck, types, extensions } from './runtime-checks';
import arr from './arr';
import ops from './table-operations';


/**
 * % EXPOSED by MODULE as default, PACKAGE as partition
 * # 
 * @dt ^Map:DataTable
 * @varName ^String
 * @classifier ^Function<* => String>
 * @@ ^Map<String;DataTable>
 */
const partition = async (dt, varName, classifier) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.isDataTable);
  const _varName = await typeCheck(2, varName, types.String);
  
  const _indexes = await indexes(_dt);
  const classified = await classify(_dt, _varName, classifier);
  const classVar = classified.get(`${_varName}:class`);
  const classNames = [...new Set(classVar)];
  
  const tables = arr.reduce(
    classNames,
    (a, k) => a.set(k, ops.newTable(_varNames)),
    new Map(),
  );
  
  _indexes.forEach((i) => {
    tables.set(
      classVar[i],
      ops.pushNext(_dt, tables.get(classVar[i]), i),
    );
  });
  
  return ops.mapValues(
    tables,
    (table) => ops.copyPasteTypes(_dt, table),
  );
};


export default partition;
