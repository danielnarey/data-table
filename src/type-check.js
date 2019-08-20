const every = require('@arr/every');
const { checkSync, checkAsync } = require('@danielnarey/data-types');


// EXPOSED: MODULE, PACKAGE
// *|promise<*> => promise<boolean>
const isDataTable = async (promise) => {
  if (!(await checkAsync.isMap(promise))) {
    return false;
  }
  
  const mp = await promise;

  if (mp.size === 0) {
    return false;
  }
  
  const values = [...mp.values()];

  if (!every(values, x => checkSync.isArray(x) || checkSync.isTypedArray(x))) {
    return false;
  }

  if (!every(values, x => x.length === values[0].length)) {
    return false;
  }

  return true;
};
