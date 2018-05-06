const path = require('path');
const fse = require('fs-extra');
const fs = require('fs');
const os = require('os');
const codeCreate = require('../../lib/code_create.js');
(function() {
    'use strict';
    module.exports = {
        topic: 'code',
        command: 'class',
        description: 'Apex class creation',
        help: 'help text for apex:class:handler:create',
        flags: [{
            name: 'apiname',
            char: 'n',
            description: 'api name of the class',
            hasValue: true,
            required: true
        }, {
            name: 'orgname',
            char: 'u',
            description: 'name of scratch org',
            hasValue: true,
            required: false
        }, {
            name: 'template',
            char: 't',
            description: 'apex class template, choose one of the following available tempplates:\nConstructor(default)\nNoConstructor\nBatch\nSchedulable\nServiceClass\nException\nTestClass',
            hasValue: true
        }, {
            name: 'apiversion',
            char: 'v',
            description: 'Api version of metadata, default 42.0',
            hasValue: true
        }, {
            name: 'push',
            description: 'push class automatically to scratch org after creation',
            hasValue: false
        }],
        run(context) {
            const template = context.flags.template !== undefined ? context.flags.template : 'Constructor';
            const orgname = context.flags.orgname;
            const apiname = context.flags.apiname;
            const outputdir = context.flags.outputdir;
            const apiversion = context.flags.apiversion !== undefined ? context.flags.apiversion : '42.0';
            const autopush = context.flags.push !== undefined;
            const vars = `api_name=${apiname},api_version=${apiversion}`;
            let templateFolder = path.join(__dirname, '../../templates/apex');
            codeCreate.createFiles(templateFolder, apiname, template, vars, outputdir, (err, success) => {
                if (err) {
                    console.error('ERROR:', err);
                    process.exit(1);
                }
                console.log(success);
                if (autopush) {
                    const exec = require('child_process').execSync;
                    if (orgname) {
                        console.log(exec(`sfdx force:source:push -f -g -u ${orgname}`).toString());
                    } else {
                        console.log(exec(`sfdx force:source:push -f -g`).toString());
                    }
                }
            });
        }
    };
}());