const { spawn } = require('child_process');

module.exports = {
  spawn(cmd, args) {
    const out = spawn(cmd, args || [], { encoding: 'utf8' });
    let output = '';

    out.stdout.on('data', (data) => {
      output += data;
    });

    return new Promise((resolve, reject) => {
      out.on('close', () => {
        resolve(output);
      });

      out.on('error', (err) => {
        reject(err);
      });
    });
  },
};
