const forceUtils = require('../../lib/forceUtils.js');
const exec = require('child_process').execSync;

(function () {
  'use strict';

  module.exports = {
    topic: 'env',
    command: 'deploy',
    description: 'Convert DX files to metadata and deploy to target env',
    help: 'help text for nab:env:deploy',
    flags: [{
      name: 'orgname',
      char: 'u',
      description: 'name of scratch org',
      hasValue: true,
      required: true
    },{
      name: 'checkonly',
      char: 'c',
      description: 'checkonly deployment',
      hasValue: false,
      required: false
    },{
      name: 'json',
      description: 'return json format',
      hasValue: false,
      required: false
    }],
    run(context) {
      let orgname = context.flags.orgname;
	    let isjson = context.flags.json !== undefined ? '--json' : '';
      let checkonly = context.flags.checkonly !== undefined ? '-c' : '';
      console.log('\x1b[31m%s\x1b[0m', 'Convert DX files to metadata...');
      console.log(exec(`sfdx force:source:convert --outputdir ./src`).toString());

      console.log('Deploy source to org...');
      let stdout = JSON.parse(exec(`sfdx force:mdapi:deploy --deploydir ./src -u ${orgname} ${checkonly} --json`).toString());
      let jobId = stdout.result.id;
      console.log('Job['+jobId+'] has been added to the Queue...');

      while(true){
        stdout = JSON.parse(exec(`sfdx force:mdapi:deploy:report -i ${jobId} -u ${orgname} --json`).toString());
        if (stdout.result.done){
          break;
        }
      }
      console.log(exec(`sfdx force:mdapi:deploy:report -i ${jobId} ${isjson}`).toString());
    }
  };
}());