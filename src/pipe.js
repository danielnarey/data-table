import { typeCheck, types, extensions } from './runtime-checks';


/**
 * % EXPOSED by MODULE as default, PACKAGE as pipe
 * # Apply multiple functions to *dt* in series, with the result of the last
 * # function piped as the first (and only) argument to the next.
 * @dt ^Map:DataTable
 * @f ^Array<Function>
 * @@ ^*
 */
const pipe = async (dt, fArray) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.isDataTable);
  const _fArray = await typeCheck(2, fArray, types.FunctionArray);

  const iterator = (lastResult, i) => {
    if (i >= _fArray.length) {
      return lastResult;
    }
    
    return iterator(_fArray[i](lastResult), i + 1);
  }

  return iterator(new Map(_dt), 0);
};


export default pipe;
