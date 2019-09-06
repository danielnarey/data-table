import { typeCheck, types, extensions } from './runtime-checks';
import arr from './arr';


/**
 * % EXPOSED by MODULE as default, PACKAGE as classify
 * # 
 * @dt ^Map:DataTable
 * @varName ^String
 * @classifier ^Function<* => String>
 * @newName=null ^String
 * @@ ^Map:DataTable
 */
const classify = async (dt, varName, classifier, newName = null) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.isDataTable);
  const _varName = await typeCheck(2, varName, types.String);
  const _classifier = await typeCheck(3, classifier, types.Function);
  
  const _newName = (
    !newName 
      ? `${varName}:class`
      : await typeCheck(4, newName, types.String)
  );

  const classVar = arr.map(
    _dt.get(_varName), 
    _classifier,
  );
  
  return new Map([
    ..._dt, 
    [_newName, classVar],
  ]);
};


export default classify;
