import { typeCheck, types, extensions } from './runtime-checks';


/**
 * % EXPOSED by MODULE as default, PACKAGE as partition
 * # 
 * @dt ^Map:DataTable
 * @varName ^String
 * @classifier ^Function<* => String>
 * @@ ^Map<String;DataTable>
 */
const partition = async (dt, varName, classifier) => {
  const _varName = await typeCheck(2, varName, types.String);

  const classified = await classify(dt, varName, classifier);
  const classVar = classified.get(`${_varName}:class`);
  const classes = [...new Set(classVar)];
  
  return arr.reduce(
    classes,
    (a, k) => a.set(k, filterByClass(k)),
    new Map(),
  );
};