const path = require('path');
const fse = require('fs-extra');
const fs = require('fs');
const os = require('os');

const codeCreate = require('../lib/code_create.js');

(function () {
  'use strict';

  module.exports = {
    topic: 'code',
    command: 'trigger',
    description: 'Create trigger handler class using SObjectDomain framework',
    help: 'help text for nab:code:trigger',
    flags: [{
      name: 'object',
      char: 'o',
      description: 'SObject',
      hasValue: true,
      required: true
    }],
    run(context) {
      const template = context.flags.template;
      const name = context.flags.name;
      const outputdir = context.flags.outputdir;
      const vars = context.flags.vars;

      let templateFolder = path.join(os.homedir(), '.sfdx-templates', template);
      if (!fse.existsSync(templateFolder)) {
        templateFolder = path.join(__dirname, '../templates', template);
      }

      codeCreate.createFiles(templateFolder, name, template, vars, outputdir, (err, success) => {

        if (err) {
          console.error('ERROR:', err);
          process.exit(1);
        }

        console.log(success);
      });
    }
  };
}());