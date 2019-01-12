const fs = require('fs');

var content =  '<?xml version="1.0" encoding="UTF-8"?>\n'+
                '<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">\n'+
                '   <actionOverrides>\n'+
                '       <actionName>Accept</actionName>\n'+
                '       <type>Default</type>\n'+
                '   </actionOverrides>\n'+
                '   <actionOverrides>\n'+
                '       <actionName>CancelEdit</actionName>\n'+
                '       <type>Default</type>\n'+
                '   </actionOverrides>\n'+
                '   <actionOverrides>\n'+
                '       <actionName>Clone</actionName>\n'+
                '       <type>Default</type>\n'+
                '   </actionOverrides>\n'+
                '   <actionOverrides>\n'+
                '       <actionName>Delete</actionName>\n'+
                '       <type>Default</type>\n'+
                '   </actionOverrides>\n'+
                '   <actionOverrides>\n'+
                '       <actionName>Edit</actionName>\n'+
                '       <type>Default</type>\n'+
                '   </actionOverrides>\n'+
                '   <actionOverrides>\n'+
                '       <actionName>List</actionName>\n'+
                '       <type>Default</type>\n'+
                '   </actionOverrides>\n'
+                '   <actionOverrides>\n'+
                '       <actionName>New</actionName>\n'+
                '       <type>Default</type>\n'+
                '   </actionOverrides>\n'+
                '   <actionOverrides>\n'+
                    '   <actionName>SaveEdit</actionName>\n'+
                    '   <type>Default</type>\n'+
                '   </actionOverrides>\n'+
                '   <actionOverrides>\n'+
                '       <actionName>Tab</actionName>\n'+
                '       <type>Default</type>\n'+
                '   </actionOverrides>\n'+
                '   <actionOverrides>\n'+
                '       <actionName>View</actionName>\n'+
                '       <type>Default</type>\n'+
                '   </actionOverrides>\n'+
                '   <allowInChatterGroups>false</allowInChatterGroups>\n'+
                '   <compactLayoutAssignment>SYSTEM</compactLayoutAssignment>\n'+
                '   <deploymentStatus>Deployed</deploymentStatus>\n'+
                '   <description>{{description}}</description>\n'+
                '   <edbxleActivities>true</edbxleActivities>\n'+
                '   <edbxleBulkApi>true</edbxleBulkApi>\n'+
                '   <edbxleChangeDataCapture>false</edbxleChangeDataCapture>\n'+
                '   <edbxleFeeds>false</edbxleFeeds>\n'+
                '   <edbxleHistory>true</edbxleHistory>\n'+
                '   <edbxleReports>true</edbxleReports>\n'+
                '   <edbxleSearch>true</edbxleSearch>\n'+
                '   <edbxleSharing>true</edbxleSharing>\n'+
                '   <edbxleStreamingApi>true</edbxleStreamingApi>\n'+
                '   <label>{{label}}</label>\n'+
                '   <nameField>\n'+
                '       <label>{{label}} Name</label>\n'+
                '       <type>Text</type>\n'+
                '   </nameField>\n'+
                '   <pluralLabel>{{label}}s</pluralLabel>\n'+
                '   <searchLayouts/>\n'+
                '   <sharingModel>{{sharingmodel}}</sharingModel>\n'+
                '</CustomObject>';

function updateContent(varName, question) {
    var stdin = require('readline-sync');
    var res = stdin.question(question);
    
    content = content.replace(new RegExp(`{{${varName}}}`, 'g'), res);

    return res;
}

(function() {

    'use strict';

    module.exports = {
        topic: 'config',
        command: 'sobject',
        description: 'Create custom object',
        help: 'help text for dbx:config:sobject',
        flags: [{
            name: 'orgname',
            char: 'u',
            description: 'name of scratch org',
            hasValue: true,
            required: false
        },{
          name: 'name',
          char: 'n',
          description: 'Custom object name',
          hasValue: true,
          required: true
        },{
            name: 'push',
            description: 'push to scratch org',
            hasValue: false
        }],

        run(context) {
            let orgname = context.flags.orgname;
            let name = context.flags.name;

            let apiname = name.replace(new RegExp(`[^A-Z0-9]`,'gi'), '_') + '__c';
            var objectpath = `./force-app/main/default/objects/${apiname}`;
            if (fs.existsSync(objectpath)) {
                console.log("This object already exists");
                process.exit(0);
            }
            fs.mkdirSync(objectpath);
            content = content.replace(new RegExp(`{{label}}`, 'g'), name);

            updateContent('description','Description: ');
            var sharingmodel = updateContent('sharingmodel','Sharing Model (Private|Public|ControlledByParent) :');
            if (sharingmodel === 'ControlledByParent'){
                console.log('When sharing model is set as controlled by parent, you must define master details :');
                var masterfield =   
                        '<?xml version="1.0" encoding="UTF-8"?>\n'+
                        '<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">\n'+
                        '    <fullName>{{fieldname}}</fullName>\n'+
                        '    <externalId>false</externalId>\n'+
                        '    <label>{{fieldlabel}}</label>\n'+
                        '    <referenceTo>{{masterobject}}</referenceTo>\n'+
                        '    <relationshipLabel>{{relationshipLabel}}</relationshipLabel>\n'+
                        '    <relationshipName>{{relationshipName}}</relationshipName>\n'+
                        '    <relationshipOrder>0</relationshipOrder>\n'+
                        '    <reparentableMasterDetail>true</reparentableMasterDetail>\n'+
                        '    <trackHistory>false</trackHistory>\n'+
                        '    <trackTrending>false</trackTrending>\n'+
                        '    <type>MasterDetail</type>\n'+
                        '    <writeRequiresMasterRead>false</writeRequiresMasterRead>\n'+
                        '</CustomField>';
                var stdin = require('readline-sync');
                var masterobject = stdin.question('Master object(API name), i.e.: Account, Invoice__c:');
                var masterlabel = stdin.question('Master field label:');
                var relationshipLabel = stdin.question('Relationship name(i.e.:"Drawdowns", "Invoice Lines"):');

                var fieldname = masterlabel.replace(new RegExp(`[^A-Z0-9]`,'gi'), '_') + '__c';
                masterfield = masterfield.replace(new RegExp(`{{fieldname}}`, 'g'), fieldname);
                masterfield = masterfield.replace(new RegExp(`{{fieldlabel}}`, 'g'), masterlabel);
                masterfield = masterfield.replace(new RegExp(`{{masterobject}}`, 'g'), masterobject);
                let relationshipName = relationshipLabel.replace(new RegExp(`[^A-Z0-9]`,'gi'), '_');
                masterfield = masterfield.replace(new RegExp(`{{relationshipLabel}}`, 'g'), relationshipLabel);
                masterfield = masterfield.replace(new RegExp(`{{relationshipName}}`, 'g'), relationshipName);

                fs.mkdirSync(objectpath+'/fields');
                fs.writeFileSync(objectpath+'/fields/'+fieldname+'.field-meta.xml', masterfield);
            }

            //update content file
            const fullpath = objectpath+'/'+apiname+'.object-meta.xml';
            fs.writeFileSync(fullpath, content);
            console.log(`\n=== Custom Object created successfully\n ${fullpath}\n`);

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