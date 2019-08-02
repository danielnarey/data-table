const typeChecking = require('./src/type-checking');
const dataImport = require('./src/data-import');
const dataExport = require('./src/data-export');
const dataTransform = require('./src/data-transform');


module.exports = {
  ...typeChecking,
  ...dataImport,
  ...dataExport,
  ...dataTransform,
};