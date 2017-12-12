const util = require('util');
const { CERT_DIR } = require('../lib/constants');
const sinon = require('sinon');
const fs = require('fs');
const logger = require('../lib/helpers/logger');

describe('List Command', () => {
  let OpenSSL = null;
  let listCommand = null;

  before(() => {
    OpenSSL = require('../lib/OpenSSL'); // eslint-disable-line global-require

    sinon.stub(OpenSSL, 'getCertificateDates').resolves({
      notBefore: 'Dec 11 22:42:43 2017 GMT',
      notAfter: 'Sep 30 22:42:43 2020 GMT',
    });

    const lstat = sinon.stub().withArgs(CERT_DIR).resolves({ isDirectory: () => true });
    const readdir = sinon.stub().withArgs(CERT_DIR).resolves([
      'dev.example.com',
      'dev.github.com',
    ]);

    sinon.stub(util, 'promisify')
      .withArgs(fs.lstat)
      .returns(lstat)
      .withArgs(fs.readdir)
      .returns(readdir);

    sinon.spy(logger, 'log');

    listCommand = require('../lib/commands/list'); // eslint-disable-line global-require
  });

  describe('list', () => {
    it('should return the correct data', () => (
      listCommand().then((result) => {
        sinon.assert.match(result, [
          {
            hostname: 'dev.example.com',
            notBefore: 'Dec 11 22:42:43 2017 GMT',
            notAfter: 'Sep 30 22:42:43 2020 GMT',
          },
          {
            hostname: 'dev.github.com',
            notBefore: 'Dec 11 22:42:43 2017 GMT',
            notAfter: 'Sep 30 22:42:43 2020 GMT',
          },
        ]);
      })
    ));

    it('should output the table', () => (
      listCommand().then(() => {
        sinon.assert.callCount(logger.log, 18);
      })
    ));
  });

  after(() => {
    OpenSSL.getCertificateDates.restore();
    util.promisify.restore();
  });
});
