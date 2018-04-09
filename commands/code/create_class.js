const path = require('path');
const fse = require('fs-extra');
const fs = require('fs');
const os = require('os');

const codeCreate = require('../../lib/code_create.js');

(function () {
  'use strict';

  module.exports = {
    topic: 'apex',
    command: 'create',
    description: 'Create trigger handler class using SObjectDomain framework',
    help: 'help text for apex:class:handler:create',
    flags: [{
      name: 'orgname',
      char: 'u',
      description: 'name of scratch org',
      hasValue: true
    }],
    run(context) {
      const template = context.flags.template;
      const name = context.flags.name;
      const outputdir = context.flags.outputdir;
      const vars = context.flags.vars;

      let templateFolder = path.join(os.homedir(), '.sfdx-templates', template);
      if (!fse.existsSync(templateFolder)) {
        templateFolder = path.join(__dirname, '../../templates', template);
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