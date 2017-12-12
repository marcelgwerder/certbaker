const assert = require('assert');
const util = require('util');
const { CERT_DIR } = require('../lib/constants');
const sinon = require('sinon');
const fs = require('fs');

describe('Bake Command', () => {
  let OpenSSL = null;
  let bakeCommand = null;

  before(() => {
    OpenSSL = require('../lib/OpenSSL'); // eslint-disable-line global-require
    bakeCommand = require('../lib/commands/bake'); // eslint-disable-line global-require

    sinon.stub(OpenSSL, 'generateCsr').resolves({
      certCsr: 'dev.example.com.csr',
      certKey: 'dev.example.com.key',
      certExt: 'dev.example.com.ext',
    });

    sinon.stub(OpenSSL, 'generateCertificate').resolves({
      cert: 'dev.example.com.crt',
      certKey: 'dev.example.com.key',
    });
  });

  describe('bake dev.example.com', () => {
    before(() => {
      const stat = sinon.stub().withArgs(CERT_DIR).rejects({ code: 'ENOENT' });
      const mkdir = sinon.stub().withArgs(CERT_DIR).resolves();

      sinon.stub(util, 'promisify')
        .withArgs(fs.stat)
        .returns(stat)
        .withArgs(fs.mkdir)
        .returns(mkdir);
    });

    it('should create the certificate when there is no existing certificate', () => (
      bakeCommand('dev.example.com', {}).then(result => assert.ok(result))
    ));

    after(() => {
      util.promisify.restore();
    });
  });

  describe('bake dev.example.com (existing)', () => {
    before(() => {
      const stat = sinon.stub().withArgs(CERT_DIR).resolves();

      sinon.stub(util, 'promisify')
        .withArgs(fs.stat)
        .returns(stat);
    });

    it('should abort when there is an existing certificate', () => {
      bakeCommand('dev.example.com', {}).catch(err => (
        assert(err, 'CB_CERTEXISTS')
      ));
    });

    it('should continue when the creation is forced with --force', () => (
      bakeCommand('dev.example.com', { force: true }).then(result => assert.ok(result))
    ));

    after(() => {
      util.promisify.restore();
    });
  });

  after(() => {
    OpenSSL.generateCsr.restore();
    OpenSSL.generateCertificate.restore();
  });
});
