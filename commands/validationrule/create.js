const path = require('path');
const fse = require('fs-extra');
const fs = require('fs');
const os = require('os');

var content =  '<?xml version="1.0" encoding="UTF-8"?>\n'+
                '<ValidationRule xmlns="http://soap.sforce.com/2006/04/metadata">\n'+
                '    <fullName>{{fullname}}</fullName>\n'+
                '    <active>true</active>\n'+
                '    <description>{{description}}</description>\n'+
                '    <errorConditionFormula>{{formula}}</errorConditionFormula>\n'+
                '    <errorMessage>{{errorMessage}}</errorMessage>\n'+
                '</ValidationRule>';

function updateContent(varName, question) {
    var stdin = require('readline-sync');
    var res = stdin.question(question);
    
    content = content.replace(new RegExp(`{{${varName}}}`, 'g'), res);
}

(function() {

    'use strict';

    module.exports = {
        topic: 'config',
        command: 'vr',
        description: 'Create validation rule',
        help: 'help text for dbx:config:vr',
        flags: [{
            name: 'orgname',
            char: 'u',
            description: 'name of scratch org',
            hasValue: true,
            required: false
        },{
          name: 'sobject',
          char: 'o',
          description: 'SObject',
          hasValue: true,
          required: true
        },{
          name: 'name',
          char: 'n',
          description: 'Validation rule name',
          hasValue: true,
          required: true
        },{
            name: 'push',
            description: 'push to scratch org',
            hasValue: false
        }],

        run(context) {
            let orgname = context.flags.orgname;
            let sobject = context.flags.sobject;
            let name = context.flags.name;

            var vrpath = `./force-app/main/default/objects/${sobject}/validationRules`;
            if (!fs.existsSync(vrpath)) {
                fs.mkdirSync(vrpath);
            }

            let apiname = name.replace(new RegExp(`[^A-Z0-9]`,'gi'), '_');
            content = content.replace(new RegExp(`{{fullname}`, 'g'), apiname);

            updateContent('description','Description: ');
            updateContent('errorMessage','Error message: ');
            updateContent('formula','Formula:\n');

            //update content file
            const fullpath = vrpath+'/'+apiname+'.validationRule-meta.xml';
            fs.writeFileSync(fullpath, content);
            console.log(`Validation rule created successfully : \n ${fullpath}`);

            if (context.flags.push){
                console.log('Push source to org...');
                try {
                    if (orgname)
                        console.log(require('child_process').execSync(`sfdx force:source:push -g -f -u ${orgname} > output.txt`).toString());
                    else 
                        console.log(require('child_process').execSync(`sfdx force:source:push -g -f > output.txt`).toString());
                } catch (err) {}
                var output = fs.readFileSync('./output.txt');
                console.log(output.toString());
                fs.unlinkSync('./output.txt');
            }
        }
    };
}());