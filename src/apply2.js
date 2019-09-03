import { typeCheck, types, extensions } from './runtime-checks';


/**
 * % EXPOSED by MODULE as default, PACKAGE as apply2
 * # Awaits *dt1*, *dt2*, and *f*, then applies *f* on the two data tables
 * # with additional parameters collected as *args*, returning the result.
 * @dt1 ^Map:DataTable
 * @dt2 ^Map:DataTable
 * @f ^Function<Map:DataTable, Map:DataTable, [**] => *>
 * @args [**]
 * @@ ^*
 */
const apply2 = async (dt1, dt2, f, ...args) => {
  const _dt1 = await typeCheck(1, dt1, types.Map, extensions.isDataTable);
  const _dt2 = await typeCheck(2, dt2, types.Map, extensions.isDataTable);
  const _f = await typeCheck(3, f, types.Function);
  
  return _f(...[].concat(new Map(_dt1), new Map(_dt2), args));
};


export default apply2;
