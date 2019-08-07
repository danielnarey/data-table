const checkSync = require('./src/type-check-sync');
const dataImport = require('./src/data-import');
const dataExport = require('./src/data-export');
const dataTransform = require('./src/data-transform');


module.exports = {
  ...checkSync,
  ...dataImport,
  ...dataExport,
  ...dataTransform,
};