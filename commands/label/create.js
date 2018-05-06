const path = require('path');
const fse = require('fs-extra');
const fs = require('fs');
const os = require('os');

function updateContent(content, values) {
    const splitValues = values.split('=');
    const varName = splitValues[0];
    const varValue = splitValues[1];
    content = content.replace(new RegExp(`{{${varName}}}`, 'g'), varValue);
    return content;
}

(function() {

    'use strict';

    module.exports = {
        topic: 'config',
        command: 'label',
        description: 'Create custom label',
        help: 'help text for dbx:label:create',
        flags: [{
            name: 'orgname',
            char: 'u',
            description: 'name of scratch org',
            hasValue: true,
            required: false
        }, {
            name: 'name',
            char: 'n',
            description: 'name of custom label',
            hasValue: true,
            required: true
        }, {
            name: 'value',
            char: 'v',
            description: 'value',
            hasValue: true,
            required: true
        }, {
            name: 'categories',
            char: 'c',
            description: 'categories',
            hasValue: true,
            required: false
        }, {
            name: 'push',
            description: 'push to scratch org',
            hasValue: false

        }],

        run(context) {
            let orgname = context.flags.orgname;
            let name = context.flags.name;
            let value = context.flags.value;
            let categories = context.flags.categories != undefined ? context.flags.categories : '';

            var labelpath = `./force-app/main/default/labels`;
            if (!fs.existsSync(labelpath)) {
                fs.mkdirSync(labelpath);
            }

            var outmetapath = `${labelpath}/CustomLabels.labels-meta.xml`;
            let content;
            let template;
            if (!fs.existsSync(outmetapath)) {
                template = path.join(__dirname, '.', 'template-meta.xml');
                content = fs.readFileSync(template).toString();
            } else {
                content = fs.readFileSync(outmetapath).toString();
            }

            //label meta content
            template = path.join(__dirname, '.', 'template-label.xml');
            let labelcontent = fs.readFileSync(template).toString();

            let apiname = name.replace(new RegExp(`[^A-Z0-9]`,'gi'), '_');
            labelcontent = updateContent(labelcontent, `name=${apiname}`);
            labelcontent = updateContent(labelcontent, `description=${name}`);
            labelcontent = updateContent(labelcontent, `value=${value}`);
            labelcontent = updateContent(labelcontent, `categories=${categories}`);
            labelcontent = labelcontent + '\n</CustomLabels>';

            //update content file
            content = content.replace(new RegExp(`</CustomLabels>`, 'g'), labelcontent);
            fs.writeFileSync(outmetapath, content);
            console.log('Label has been created successfully');

            if (context.flags.push){
                console.log('Push source to org...');
                try {
                    console.log(exec(`sfdx force:source:push -g -f -u ${orgname} > output.txt`).toString());
                } catch (err) {}
                var output = fs.readFileSync('./output.txt');
                console.log(output.toString());
                fs.unlinkSync('./output.txt');
            }
        }
    };
}());