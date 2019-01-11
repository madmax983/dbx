const fs = require('fs');
const exec = require('child_process').execSync;

var js2xmlparser = require('js2xmlparser');

function process(parentfolder, apiversion){
    var parentpath = `./force-app${parentfolder}`;
    if (fs.statSync(parentpath).isDirectory()){
        console.log(parentpath);
        fs.readdirSync(parentpath).forEach(file => {
            process(parentfolder+'/'+file,apiversion);
        });
    }else{
        console.log(parentpath);
        var content = fs.readFileSync(parentpath).toString();
        content = content.replace(new RegExp(`<apiVersion>.+</apiVersion>`,'g'), '<apiVersion>'+apiversion+'.0</apiVersion>');
        fs.writeFileSync(parentpath,content);
    }
}
(function() {

    'use strict';

    module.exports = {
        topic: 'api',
        command: 'set',
        description: 'Build profile into xml',
        help: 'help text for dbx:profile:build',
        flags: [{
            name: 'apiversion',
            char: 'v',
            description: 'apiversion',
            hasValue: true,
            required: true
        },{
            name: 'orgname',
            char: 'u',
            description: 'orgname',
            hasValue: true,
            required: false
        },{
            name: 'merge',
            char: 'm',
            description: 'perform mdapi:retrieve and mdapi:convert of the entire force-app',
            hasValue: false,
            required: false
        }],

        run(context) {
            const apiversion = context.flags.apiversion;
            const orgname = context.flags.orgname;
            const merge = context.flags.merge != undefined;

            var content = JSON.parse(fs.readFileSync('sfdx-project.json').toString());
            content.sourceApiVersion = apiversion + '.0';
            fs.writeFileSync('sfdx-project.json',JSON.stringify(content, null, 2));

            process('',apiversion);
            console.log('Project has been set to api version'+apiversion);

            if (merge){
                fs.mkdirSync('mdapiout');
                console.log(exec(`sfdx force:mdapi:retrieve -a ${apiversion}.0 -u ${orgname} -r mdapiout`).toString());
                //delete everything under default
            }
        }
    };
}());