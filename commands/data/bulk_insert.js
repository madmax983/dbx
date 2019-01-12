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
          console.log(body);          
          console.log('Job created['+body.id+'] successfully...');
          addBatch(body.id, accessToken, instanceUrl);
        }else{
          console.log('Unexpected Error!');
          console.log(response);
        }
    }
  );
}

const fileToBuffer = (filename, cb) => {
  let readStream = fs.createReadStream(filename);
  let chunks = [];

  // Handle any errors while reading
  readStream.on('error', err => {
      // handle error

      // File could not be read
      return cb(err);
  });

  // Listen for data
  readStream.on('data', chunk => {
      chunks.push(chunk);
  });

  // File is done being read
  readStream.on('close', () => {
      // Create a buffer of the image from the stream
      return cb(null, Buffer.concat(chunks));
  });
}

function addBatch(jobId, accessToken, instanceUrl){
  fileToBuffer('./config/accounts2.csv', (err, imageBuffer) => {
    if (err) { 
      console.log(err);
    } else {
      const options = {
        method  : 'PUT',
        headers : {
                    'Content-Type' : 'text/csv',
                    'Accept' : 'application/json',
                    'Authorization' : 'Bearer '+accessToken,
                    'X-SFDC-Session' : accessToken
                  },
        url     : instanceUrl+'/services/data/v42.0/jobs/ingest/'+jobId+'/batches',
        json: false,
        body    : imageBuffer.toString()
      };
      request(options,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
              console.log(body);
              //closeJob(jobId, accessToken, instanceUrl);
            }else{
              console.log('Unexpected Error!');
              console.log(response);
              console.log(imageBuffer.toString()); 
            }
        }
      );
    }
  });

  /**/
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

function getResults(jobId, accessToken, instanceUrl){
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
}

(function () {
  'use strict';

  module.exports = {
    topic: 'data',
    command: 'bulk2',
    description: 'Bulk api insert',
    help: 'help text for dbx:data:bulk2',
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