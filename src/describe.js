import { typeCheck, types, extensions } from './runtime-checks';
import arr from './arr';


/**
 * % EXPOSED by MODULE as default, PACKAGE as describe
 * # Returns a Map containing a human-readable description of the observed
 * # values for each variable.
 * @dt ^Map:DataTable
 * @@ ^Map<String;String>
 */
const describe = async (dt) => {
  return new Map();
};


export default describe;
