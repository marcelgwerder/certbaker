require('util.promisify/shim')();
const util = require('util');
const path = require('path');
const os = require('os');
const fs = require('fs');
const chalk = require('chalk');
const OpenSSL = require('../OpenSSL');

const { log } = require('../helpers/logger');

const appdir = path.resolve(os.homedir(), '.certbaker');
const certDir = `${appdir}/certificates`;

module.exports = () => {
  const readdir = util.promisify(fs.readdir);
  const lstat = util.promisify(fs.lstat);

  return readdir(certDir)
    .then((items) => {
      const list = [];

      items.forEach((item) => {
        list.push(lstat(path.resolve(certDir, item)).then((stats) => {
          if (stats.isDirectory()) {
            const cert = path.resolve(certDir, item, `${item}.crt`);

            return OpenSSL.getCertificateDates(cert).then(data => ({
              hostname: item,
              notBefore: data.notBefore,
              notAfter: data.notAfter,
            }));
          }

          return false;
        }));
      });

      return Promise.all(list);
    })
    .then((certs) => {
      log(`You have ${chalk.bold(certs.length)} baked certificate${certs.length > 1 ? 's' : ''}:`);

      certs.forEach((cert) => {
        log('');
        log(cert.hostname);
        log(`  Valid From:    ${cert.notBefore}`);
        log(`  Valid Through: ${cert.notAfter}`);
      });

      return certs;
    })
    .catch((fail) => {
      log(fail);
    });
};
