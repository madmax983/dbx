const fs = require('fs');
const exec = require('child_process').execSync;

var fieldlist = '';
var content =   '<?xml version="1.0" encoding="UTF-8"?>\n'+
                '<fieldSets xmlns="http://soap.sforce.com/2006/04/metadata">\n'+
                '   <fullName>{{fullname}}</fullName>\n'+
                '   <description>{{description}}</description>\n'+
                '{{fieldlist}}'+
                '   <label>{{label}}</label>\n'+
                '</fieldSets>';

function updateContent(varName, question) {
    var stdin = require('readline-sync');
    var res = stdin.question(question);
    
    content = content.replace(new RegExp(`{{${varName}}}`, 'g'), res);
}

(function() {

    'use strict';

    module.exports = {
        topic: 'config',
        command: 'fieldset',
        description: 'Create field set',
        help: 'help text for nab:config:fieldset',
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
        },{
          name: 'name',
          char: 'n',
          description: 'Fieldset name',
          hasValue: true,
          required: true
        },{
            name: 'push',
            description: 'push to scratch org',
            hasValue: false
        },{
            name: 'displayfield',
            char: 'f',
            description: 'display sobject fields',
            hasValue: false
        }],

        run(context) {
            let orgname = context.flags.orgname;
            let sobject = context.flags.sobject;
            let name = context.flags.name;

            var vrpath = `./force-app/main/default/objects/${sobject}/fieldSets`;
            if (!fs.existsSync(vrpath)) {
                fs.mkdirSync(vrpath);
            }

            let apiname = name.replace(new RegExp(`[^A-Z0-9]`,'gi'), '_');
            content = content.replace(new RegExp(`{{label}}`, 'g'), name);
            content = content.replace(new RegExp(`{{fullname}}`, 'g'), apiname);

            updateContent('description','Description: ');

            if (context.flags.displayfield){
                var objectschema = JSON.parse(exec('sfdx force:schema:sobject:describe -s '+sobject+' '+(orgname ? '-u '+ orgname : '') +' --json').toString());
                if (objectschema.result.queryable){
                    var fields = "Name";
                    objectschema.result.fields.forEach(function(f){
                        if(!f.deprecatedAndHidden && f.name !== 'Name') fields = fields +","+ f.name;
                    });
                }
                console.log('\n=== Available Object Fields \n'+fields+'\n');
            }
            var stdin = require('readline-sync');
            var res = stdin.question('Fields (APIName with comma separated): ');
            res.split(',').forEach(function(elem){
                var displayFieldTemplate = 
                '   <displayedFields>\n'+
                '       <field>{{fieldname}}</field>\n'+
                '   </displayedFields>\n';
                fieldlist += displayFieldTemplate.replace(new RegExp(`{{fieldname}}`, 'g'), elem.trim());
            });
            content = content.replace(new RegExp(`{{fieldlist}}`, 'g'), fieldlist);

            //update content file
            const fullpath = vrpath+'/'+apiname+'.fieldSet-meta.xml';
            fs.writeFileSync(fullpath, content);
            console.log(`\n=== Fieldset created successfully\n${fullpath}\n`);

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