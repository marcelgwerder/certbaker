const os = require('os');
const path = require('path');

const appdir = path.resolve(os.homedir(), '.certbaker');

module.exports = {
  APP_DIR: appdir,
  CERT_DIR: path.resolve(appdir, 'certificates'),
};
