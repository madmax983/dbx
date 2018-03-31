const forceUtils = require('../lib/forceUtils.js');
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
      hasValue: true
    }],
    run(context) {
      let orgname = context.flags.orgname;
      
      console.log('Convert DX files to metadata...');
      console.log(exec(`sfdx force:source:convert --outputdir ./src --packagename nab`).toString());

      console.log('Deploy source to org...');
      let stdout = JSON.parse(exec(`sfdx force:mdapi:deploy --deploydir ./src -u ${orgname} --json`).toString());
      let jobId = stdout.result.id;
      console.log('Job['+jobId+'] has been added to the Queue...');

      while(true){
        stdout = JSON.parse(exec(`sfdx force:mdapi:deploy:report -i ${jobId} --json`).toString());
        if (stdout.result.done){
          break;
        }
      }
      console.log(exec(`sfdx force:mdapi:deploy:report -i ${jobId}`).toString());
    }
  };
}());

/*
{"status":0,"result":{"checkOnly":false,"completedDate":"2018-03-31T10:04:12.000Z",
"createdBy":"0050l0000015e8a","createdByName":"User User","createdDate":"2018-03-31T10:04:09.000Z",
"details":{"componentSuccesses":{"changed":"false","componentType":"ApexClass","created":"false","createdDate":"2018-03-31T10:04:11.000Z",
"deleted":"false","fileName":"src/classes/AccountTriggerHandler.cls","fullName":"AccountTriggerHandler",
"id":"01p0l000000MzLBAA0","success":"true"},
"runTestResult":{"numFailures":"0","numTestsRun":"0","totalTime":"0.0"}},
"done":true,"id":"0Af0l00000HWXJQCA5","ignoreWarnings":false,"lastModifiedDate":"2018-03-31T10:04:12.000Z","numberComponentErrors":0,"numberComponentsDeployed":1,"numberComponentsTotal":1,"numberTestErrors":0,"numberTestsCompleted":0,"numberTestsTotal":0,"rollbackOnError":true,"runTestsEnabled":"false","startDate":"2018-03-31T10:04:09.000Z","status":"Succeeded","success":true}}
*/