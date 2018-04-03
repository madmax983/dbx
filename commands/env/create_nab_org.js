const forceUtils = require('../../lib/forceUtils.js');
const exec = require('child_process').execSync;

(function () {
  'use strict';

  module.exports = {
    topic: 'env',
    command: 'create',
    description: 'Create nab standard scratch org',
    help: 'help text for nab:env:create',
    flags: [{
      name: 'orgname',
      char: 'u',
      description: 'name of scratch org',
      hasValue: true
    }],
    run(context) {
      let orgname = context.flags.orgname;
      console.log('Create scratch org...');
      console.log(exec(`sfdx force:org:create -f config/project-scratch-def.json -a ${orgname} -s -d 30`).toString());
      //TO DO : open org and wait for input. User must enable Account Contact Relationships
      //TO DO : install FSC core, ext1, ext2
      console.log('Push source to org...');
      console.log(exec(`sfdx force:source:push -f`).toString());
      //TO DO : deploy legacy package
      //TO DO : add permission set
      //TO DO : import data
      console.log(exec(`sfdx force:org:open`).toString());
    }
  };
}());