import { typeCheck, types, extensions } from './runtime-checks';


/**
 * % EXPOSED by MODULE as default, PACKAGE as indexes
 * # Returns an array containing the sequence of indexes from 0 to one less 
 * # than the size of *dt*.
 * @dt ^Map:DataTable
 * @@ ^TypedArray:Uint32Array
 */
const indexes = async (dt) => {
  const _size = await size(dt);
  
  return Uint32Array.from(
    { length: _size.observations }, 
    (x, i) => i,
  );
};


export default indexes;
