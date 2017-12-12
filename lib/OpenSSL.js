const { spawn } = require('./helpers/cli');
const path = require('path');
const fs = require('fs');
const util = require('util');
const dedent = require('dedent');

const writeFile = util.promisify(fs.writeFile);
const { APP_DIR } = require('./constants');

module.exports = class OpenSSL {
  static getVersion() {
    return spawn('openssl', ['version']);
  }

  static generateRootCA(exportPath) {
    const rootCertPem = path.resolve(exportPath, 'rootCA.pem');
    const rootCertCrt = path.resolve(exportPath, 'rootCA.crt');
    const rootKey = path.resolve(exportPath, 'rootCA.key');

    const subj = '/C=CH/ST=BE/L=World/O=Certbaker Dev Root CA/';

    return spawn('openssl', ['req',
      '-x509', '-nodes', '-new', '-sha256', '-days', '1024',
      '-newkey', 'rsa:2048', '-keyout', rootKey,
      '-out', rootCertPem, '-subj', subj,
    ]).then(() => spawn('openssl', ['x509',
      '-outform', 'der',
      '-in',
      rootCertPem,
      '-out',
      rootCertCrt,
    ]));
  }

  static generateCsr(commonName, exportPath) {
    const certKey = path.resolve(exportPath, `${commonName}.key`);
    const certCsr = path.resolve(exportPath, `${commonName}.csr`);
    const certExt = path.resolve(exportPath, `${commonName}.ext`);

    const subj = `/C=CH/ST=BE/L=World/O=Certbaker/CN=${commonName}`;

    const opensslPromise = spawn('openssl', ['req',
      '-new',
      '-nodes',
      '-newkey',
      'rsa:2048',
      '-keyout',
      certKey,
      '-out',
      certCsr,
      '-subj',
      subj,
    ]);

    // Create an ext file that will be used for generating the certificate.
    // It ensures the certificate will be trusted by more clients.
    const extfilePromise = writeFile(certExt, dedent`
      authorityKeyIdentifier=keyid,issuer
      basicConstraints=CA:FALSE
      keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
      subjectAltName = @alt_names
      [alt_names]
      DNS.1 = ${commonName}
    `);

    return Promise.all([opensslPromise, extfilePromise]).then(() => ({
      certKey,
      certCsr,
      certExt,
    }));
  }

  static generateCertificate(certCsr, certKey, certExt, cert) {
    const rootCA = path.resolve(APP_DIR, 'rootCA.pem');
    const rootCAKey = path.resolve(APP_DIR, 'rootCA.key');

    return spawn('openssl', ['x509',
      '-req', '-sha256', '-days', '1024',
      '-in',
      certCsr,
      '-CA',
      rootCA,
      '-CAkey',
      rootCAKey,
      '-CAcreateserial',
      '-extfile',
      certExt,
      '-out',
      cert,
    ]).then(() => ({
      cert,
      certKey,
    }));
  }

  static getCertificateDates(cert) {
    return spawn('openssl', ['x509',
      '-in',
      cert,
      '-dates',
      '-noout',
    ]).then((text) => {
      const splitExp = /([^=]+)=(.*)/;
      const data = {};
      text.split('\n').forEach((line) => {
        const lineData = splitExp.exec(line);
        if (lineData !== null) {
          const [key, value] = [lineData[1], lineData[2]];

          data[key] = value;
        }
      });

      return data;
    });
  }
};
