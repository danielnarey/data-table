import { typeCheck, types, extensions } from './runtime-checks';


/**
 * % EXPOSED by MODULE as default, PACKAGE as apply
 * # Awaits *dt* and *f*, then applies *f* to *dt* with additional parameters
 * # collected as *args*, returning the result.
 * @dt ^Map:DataTable
 * @f ^Function<Map:DataTable, [**] => *>
 * @args [**]
 * @@ ^*
 */
const apply = async (dt, f, ...args) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.DataTable);
  const _f = await typeCheck(2, f, types.Function);
  
  return _f(...[].concat(new Map(_dt), args));
};


export default apply;
