const sinon = require('sinon');
const { spawn } = require('../lib/helpers/cli');

describe('cli', () => {
  describe('#spawn()', () => {
    it('should call the correct command and provide the output', () => (
      spawn('echo', ['"Test"']).then((output) => {
        sinon.assert.match(output, 'Test');
      })
    ));

    it('should reject if the command is invalid', () => (
      spawn('exit').catch((err) => {
        sinon.assert.match(err.code, 'ENOENT');
      })
    ));
  });
});
