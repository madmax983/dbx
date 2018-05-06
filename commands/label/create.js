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

(function () {

  'use strict';

  module.exports = {

    topic: 'label',

    command: 'create',

    description: 'Create custom label',

    help: 'help text for dbx:label:create',

    flags: [{

        name: 'orgname',

        char: 'u',

        description: 'name of scratch org',

        hasValue: true,

        required: true

	},{

        name: 'name',

        char: 'n',

        description: 'name of custom label',

        hasValue: true,

        required: true

	},{

      name: 'value',

      char: 'v',

      description: 'value',

      hasValue: true,

      required: true

    },{

        name: 'categories',

        char: 'c',

        description: 'categories',

        hasValue: true,

        required: false

	}, {

        name: 'protected',

        char: 'p',

        description: 'protected',

        hasValue: false,

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
      let categories = context.flags.categories;
      let protected = context.flags.protected !== undefined;

      var ext = path.extname(file).substring(1);
      var labelpath = `./force-app/main/default/labels`;
      if (!fs.existsSync(labelpath)){
        fs.mkdirSync(labelpath);
      }

      var outmetapath = `${labelpath}/CustomLabels.labels-meta.xml`;
      let content;
      if (!fs.existsSync(outmetapath)){
      	let template = path.join(__dirname,'.', 'template-meta.xml');
      	content = fs.readFileSync(template).toString();
      }else{
      	content = fs.readFileSync(outmetapath).toString();
      }

      //label meta content
      let template = path.join(__dirname,'.', 'template-label.xml');
      let labelcontent = fs.readFileSync(template).toString();

      let apiname = name.replace(/[^\w\s]/gi, '_');
      labelcontent = updateContent(labelcontent, `name=${apiname}`);
      labelcontent = updateContent(labelcontent, `description=${name}`);
      labelcontent = updateContent(labelcontent, `value=${value}`);
      labelcontent = updateContent(labelcontent, `categories=${categories}`);
      labelcontent = updateContent(labelcontent, `protected=${protected}`);
      labelcontent = labelcontent + '\n</CustomLabels>';

      //update content file
      content = content.replace(new RegExp(`</CustomLabels>`,'g'), labelcontent);
      fs.writeFileSync(outmetapath, content);
      console.log('Label has been created successfully');
    }
  };
}());