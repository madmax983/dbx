const path = require('path');
const fse = require('fs-extra');
const fs = require('fs');
const os = require('os');

function updateContent(content, values) {
  const splitValues = values.split('=');

  const varName = splitValues[0];
  const varValue = splitValues[1];

  content = content.replace(new RegExp(`{{${varName}}}`,'g'), varValue);
  return content;
}

function createFiles(templateFolder, sobject, vars, done) {

  const name = sobject.replace('__c','').replace('_','') + 'Trigger';
  vars =  'className='+sobject.replace('__c','').replace('_','') + 'TriggerHandler,'+
          'triggerName='+sobject.replace('__c','').replace('_','') + 'Trigger,'+
          'apiName=42.0,'+
          'sobject='+sobject;

  const outputdir = './force-app/main/default';

  if (!fse.existsSync(templateFolder)) {
    done(`specified template 'trigger' doesn't exist`, null);
  }

  const defJsonPath = path.join(templateFolder, 'def.json');

  if (!fse.existsSync(defJsonPath)) {
    done('def.json not found', null);
  }

  const defJson = JSON.parse(fs.readFileSync(defJsonPath).toString());
  const defJsonVars = defJson.vars;
  const defJsonBundle = defJson.bundle;
  const defJsonFiles = defJson.files;
  
  if (!vars) {
    done(`The following variables are required: ${defJsonVars}. Specify them like: -v className=myclass,apiName=40.0`, null);
  }

  const filesCreated = [];

  defJsonFiles.forEach((row) => {
    const fileName = row[0];
    const fileExtension = row[1];
    if (fileName !== 'def.json') {

      const templateFilePath = path.join(templateFolder, fileName);
      let content = fs.readFileSync(templateFilePath).toString();

      const splitVars = vars.split(',');
      splitVars.forEach((value) => {
        content = updateContent(content, value);
      });

      let newFile = path.join(`${outputdir}/triggers`, `${name}.${fileExtension}`);
      if (fileExtension.toString().includes('cls')) {
        newFile = path.join(`${outputdir}/classes`, `${name}Handler.${fileExtension}`);
      }

      const newFilePath = path.dirname(newFile);

      fse.ensureDirSync(newFilePath);
      fs.writeFileSync(newFile, content);
      filesCreated.push(newFile);
    }
  });

  let result = 'The following files were created:';
  for (let i = 0; i < filesCreated.length; i++) {
    result += `\n  ${filesCreated[i]}`;
  }

  console.log(result);
}

(function () {
  'use strict';

  module.exports = {
    topic: 'code',
    command: 'trigger',
    description: 'Create trigger handler class using SObjectDomain framework',
    help: 'help text for nab:code:trigger',
    flags: [{
      name: 'sobject',
      char: 'o',
      description: 'SObject',
      hasValue: true,
      required: true
    },{
      name: 'apiversion',
      char: 'v',
      description: 'api version',
      hasValue: true,
      required: false
    }],
    run(context) {
      let config = JSON.parse(fs.readFileSync('./sfdx-project.json').toString());
      const sobject = context.flags.sobject;
      const apiversion = context.flags.apiversion ? context.flags.apiversion : config.sourceApiVersion;

      const template = 'trigger';
      const vars =  'className='+sobject.replace('__c','').replace('_','') + 'Handler,'+
                    'triggerName='+sobject.replace('__c','').replace('_','') + 'Trigger,'+
                    'apiVersion='+apiversion+','+
                    'sobject='+sobject;

      let templateFolder = path.join(os.homedir(), '.sfdx-templates', template);
      if (!fse.existsSync(templateFolder)) {
        templateFolder = path.join(__dirname, '../../templates', template);
      }

      createFiles(templateFolder, sobject, template, vars, (err, success) => {

        if (err) {
          console.error('ERROR:', err);
          process.exit(1);
        }

        console.log(success);
      });
    }
  };
}());