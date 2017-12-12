const sinon = require('sinon');
const { log } = require('../lib/helpers/logger');

describe('logger', () => {
  describe('#log()', () => {
    before(() => {
      sinon.stub(console, 'log')
        .withArgs('I\'m in production')
        .returns()
        .withArgs('I\'m in test')
        .returns();

      console.log.callThrough();
    });

    it('should log if in production environment', () => {
      sinon.stub(process.env, 'NODE_ENV').value('production');

      log('I\'m in production');

      sinon.assert.calledWith(console.log, 'I\'m in production');
    });

    it('should not log if in test environment', () => {
      sinon.stub(process.env, 'NODE_ENV').value('test');

      log('I\'m in test');

      sinon.assert.neverCalledWith(console.log, 'I\'m in test');
    });

    after(() => {
      console.log.restore();
    });
  });
});
