#!/usr/bin/env node

const commander = require('commander');
const chalk = require('chalk');
const path = require('path');
const util = require('util');
const fs = require('fs');
const bakeCommand = require('../lib/commands/bake');
const listCommand = require('../lib/commands/list');
const pkg = require('../package.json');
const OpenSSL = require('../lib/OpenSSL');
const { APP_DIR, CERT_DIR } = require('../lib/constants');

const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);

const { log } = console;

commander
  .version(pkg.version)
  .description(pkg.description);

commander
  .command('bake <common_name>')
  .usage('<common_name> [options]')
  .description('Bake a new certificate using the given common name.')
  .alias('b')
  .option('-f, --force', 'Force the creation of the certificate, even if it already exists.')
  .action(bakeCommand)
  .on('--help', () => {
    log('');
    log('  Examples:');
    log('');
    log('    $ certbaker generate dev.example.com');
    log('    $ certbaker generate dev.example.com -f');
    log('');
  });

commander
  .command('list')
  .description('List the generated certificates.')
  .action(listCommand);

OpenSSL.getVersion().then((openSSLVersion) => {
  log(`${chalk.bold('Info:')} Working with ${openSSLVersion}`);

  // Initialize the application
  return stat(APP_DIR).catch((err) => {
    if (err.code === 'ENOENT') {
      // Create a new directory for the app in the users home directory.
      return mkdir(APP_DIR, 0o777).then(() => mkdir(CERT_DIR, 0o777));
    }

    return Promise.reject(err);
  }).then(() => {
    const rootCA = path.resolve(APP_DIR, 'rootCA.pem');

    return stat(rootCA).catch((err) => {
      if (err.code === 'ENOENT') {
        // Generate a new root certificate and key
        return OpenSSL.generateRootCA(APP_DIR);
      }

      return Promise.reject(err);
    });
  });
}, () => {
  log(`${chalk.red('✗')}' Could not find OpenSSL, make sure it is installed and accessible.`);
}).then(() => {
  commander.parse(process.argv);

  if (!commander.args.length) {
    commander.help();
  }
});
