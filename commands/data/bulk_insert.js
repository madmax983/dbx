const request = require('request');
const exec = require('child_process').execSync;
const fs = require('fs');

function createJob(sobject, accessToken, instanceUrl){
  const options = {
    method  : 'POST',
    headers : {
                'Content-Type' : 'application/json; charset=UTF-8',
                'Accept' : 'application/json',
                'Authorization' : 'Bearer ' + accessToken,
                'X-SFDC-Session' : accessToken
              },
    url     : instanceUrl+'/services/data/v42.0/jobs/ingest/',
    json: true,
    body    : {
                "object" : sobject,
                "contentType" : "CSV",
                "operation" : "insert",
                "lineEnding": "CRLF"
              }
  };
  console.log(options);
  request(options,
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log('Job created['+body.id+'] successfully...');
          addBatch(body.id, accessToken, instanceUrl);
        }else{
          console.log('Unexpected Error!');
          console.log(response);
        }
    }
  );
}

function addBatch(jobId, accessToken, instanceUrl){
  const content = fs.readFileSync('./config/account.csv');
  console.log(content);
  const options = {
    method  : 'PUT',
    headers : {
                'Content-Type' : 'text/csv',
                'Accept' : 'application/json',
                'Authorization' : 'Bearer '+accessToken,
                'X-SFDC-Session' : accessToken
              },
    url     : instanceUrl+'/services/data/v42.0/jobs/ingest/'+jobId+'/batches',
    json: true,
    body    : content
  };
  console.log(options);
  request(options,
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body);
          closeJob(jobId, accessToken, instanceUrl);
        }else{
          console.log('Unexpected Error!');
          console.log(response);
        }
    }
  );
}

function closeJob(jobId, accessToken, instanceUrl){
  const options = {
    method  : 'PATCH',
    headers : {
                'Content-Type' : 'application/json; charset=UTF-8',
                'Accept' : 'application/json',
                'Authorization' : 'Bearer '+accessToken,
                'X-SFDC-Session' : accessToken
              },
    url     : instanceUrl+'/services/data/v42.0/jobs/ingest/'+jobId,
    json: true,
    body    : {
                "status" : "UploadComplete"
              }
  };
  console.log(options);
  request(options,
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body);
          getResults(jobId, accessToken, instanceUrl);
        }else{
          console.log('Unexpected Error!');
          console.log(response);
        }
    }
  );
}

/*function getResults(jobId, accessToken, instanceUrl){
  const options = {
    method  : 'GET',
    headers : {
                'Content-Type' : 'application/json; charset=UTF-8',
                'Accept' : 'application/json',
                'Authorization' : 'Bearer '+accessToken,
                'X-SFDC-Session' : accessToken
              },
    url     : instanceUrl+'/services/data/v42.0/jobs/ingest/'+jobId+'/successfulResults',
    json: true
  };
  console.log(options);
  request(options,
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body);
        }else{
          console.log('Unexpected Error!');
          console.log(response);
        }
    }
  );
}*/

(function () {
  'use strict';

  module.exports = {
    topic: 'data',
    command: 'bulk2',
    description: 'Bulk api insert',
    help: 'help text for nab:data:bulk2',
    flags: [{
      name: 'orgname',
      char: 'u',
      description: 'name of scratch org',
      hasValue: true,
      required: true
    },{
      name: 'sobject',
      char: 'o',
      description: 'SObject',
      hasValue: true,
      required: true
    }],
    run(context) {
        let orgname = context.flags.orgname;
        let sobject = context.flags.sobject;
        let stdout = JSON.parse(exec(`sfdx force:org:display -u ${orgname} --json`).toString());

        const accessToken = stdout.result.accessToken;
        const instanceUrl = stdout.result.instanceUrl;

        createJob(sobject, accessToken, instanceUrl);
    }
  };
}());
//{"status":0,"result":{"username":"test-btasevtomofl@example.com","devHubId":"david.browaeys@smsmt.demo.com","id":"00Dp00000008xgBEAQ","createdBy":"david.browaeys@smsmt.demo.com","createdDate":"2018-03-30T22:20:25.000+0000","expirationDate":"2018-04-29","status":"Active","edition":"Enterprise","orgName":"davidbrowaeys Company","accessToken":"00Dp00000008xgB!AREAQK3qHT6hCoCL0RG.mFfRn4wzpk9D2SNGXKip8O1MFGDFnxMr0AloysB5dRcUxUiVOlhvJjRFGgHqhmpH18c3IkWkIL7x","instanceUrl":"https://computing-energy-7259.cs31.my.salesforce.com","clientId":"SalesforceDevelopmentExperience","alias":"undefined"}}