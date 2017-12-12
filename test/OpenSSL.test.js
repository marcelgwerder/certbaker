const assert = require('assert');
const util = require('util');
const { CERT_DIR, APP_DIR } = require('../lib/constants');
const sinon = require('sinon');
const fs = require('fs');
const cli = require('../lib/helpers/cli');
const path = require('path');

const writeFileStub = sinon.stub().resolves();

describe('OpenSSL', () => {
  let OpenSSL = null;
  const commonName = 'dev.example.com';
  const exportPath = path.resolve(CERT_DIR, commonName);
  const cert = path.resolve(exportPath, `${commonName}.crt`);
  const certKey = path.resolve(exportPath, `${commonName}.key`);
  const certCsr = path.resolve(exportPath, `${commonName}.csr`);
  const certExt = path.resolve(exportPath, `${commonName}.ext`);
  const rootCertPem = path.resolve(APP_DIR, 'rootCA.pem');
  const rootCertCrt = path.resolve(APP_DIR, 'rootCA.crt');
  const rootKey = path.resolve(APP_DIR, 'rootCA.key');

  before(() => {
    sinon.stub(cli, 'spawn');

    sinon.stub(util, 'promisify')
      .withArgs(fs.writeFile)
      .returns(writeFileStub);

    OpenSSL = require('../lib/OpenSSL'); // eslint-disable-line global-require
  });

  afterEach(() => {
    cli.spawn.resetBehavior();
    util.promisify.resetBehavior();
  });

  describe('#getVersion()', () => {
    before(() => {
      cli.spawn.resolves('OpenSSL 1.0.2g  1 Mar 2016');
    });

    it('should run the correct openssl command', () => (
      OpenSSL.getVersion().then((version) => {
        sinon.assert.called(cli.spawn);
        assert(version, 'OpenSSL 1.0.2g  1 Mar 2016');
      })
    ));
  });

  describe('#generateRootCA()', () => {
    before(() => {
      cli.spawn.resolves();
    });

    it('should run the correct openssl command', () => (
      OpenSSL.generateRootCA(APP_DIR).then(() => {
        const subj = '/C=CH/ST=BE/L=World/O=Certbaker Dev Root CA/';

        sinon.assert.calledWith(cli.spawn, 'openssl', ['req',
          '-x509', '-nodes', '-new', '-sha256', '-days', '1024',
          '-newkey', 'rsa:2048', '-keyout', rootKey,
          '-out', rootCertPem, '-subj', subj,
        ]);

        sinon.assert.calledWith(cli.spawn, 'openssl', ['x509',
          '-outform', 'der',
          '-in',
          rootCertPem,
          '-out',
          rootCertCrt,
        ]);
      })
    ));
  });

  describe('#generateCsr()', () => {
    const subj = `/C=CH/ST=BE/L=World/O=Certbaker/CN=${commonName}`;

    before(() => {
      cli.spawn.resolves();
    });

    it('should run the correct openssl command', () => (
      OpenSSL.generateCsr(commonName, exportPath).then(() => {
        sinon.assert.calledWith(cli.spawn, 'openssl', ['req',
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
      })
    ));

    it('should create an extfile', () => (
      OpenSSL.generateCsr(commonName, exportPath).then(() => {
        sinon.assert.called(writeFileStub);
      })
    ));

    it('should return the correct data', () => (
      OpenSSL.generateCsr(commonName, exportPath).then((result) => {
        sinon.assert.match(result, {
          certKey,
          certCsr,
          certExt,
        });
      })
    ));
  });

  describe('#generateCertificate()', () => {
    beforeEach(() => {
      cli.spawn.resolves();
    });

    it('should run the correct openssl command', () => (
      OpenSSL.generateCertificate(certCsr, certKey, certExt, cert).then(() => {
        sinon.assert.calledWith(cli.spawn, 'openssl', ['x509',
          '-req', '-sha256', '-days', '1024',
          '-in',
          certCsr,
          '-CA',
          rootCertPem,
          '-CAkey',
          rootKey,
          '-CAcreateserial',
          '-extfile',
          certExt,
          '-out',
          cert,
        ]);
      })
    ));

    it('should return the correct data', () => (
      OpenSSL.generateCertificate(certCsr, certKey, certExt, cert).then((result) => {
        sinon.assert.match(result, {
          cert,
          certKey,
        });
      })
    ));
  });

  describe('#getCertificateDates()', () => {
    beforeEach(() => {
      cli.spawn.resolves('notBefore=Dec 11 22:42:43 2017 GMT\n' +
      'notAfter=Sep 30 22:42:43 2020 GMT\n');
    });

    it('should run the correct openssl command', () => (
      OpenSSL.getCertificateDates(cert).then(() => {
        sinon.assert.calledWith(cli.spawn, 'openssl', ['x509',
          '-in',
          cert,
          '-dates',
          '-noout',
        ]);
      })
    ));

    it('should return the correct data', () => (
      OpenSSL.getCertificateDates(cert).then((result) => {
        sinon.assert.match(result, {
          notBefore: 'Dec 11 22:42:43 2017 GMT',
          notAfter: 'Sep 30 22:42:43 2020 GMT',
        });
      })
    ));
  });

  after(() => {
    util.promisify.restore();
  });
});
