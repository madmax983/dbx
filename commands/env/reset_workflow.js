const forceUtils = require('../../lib/forceUtils.js');
const exec = require('child_process').execSync;
const path = require('path');
const fs = require('fs');


function displayOutput(){
	var output = fs.readFileSync('./output.txt');
	console.log(output.toString());
}
function update_workflows(dirfile,username){
	let content = fs.readFileSync(dirfile).toString();
	content = content.replace(new RegExp(`<lookupValue>.+</lookupValue>(\s+|)<!--username-->`,'g'), '<lookupValue>'+username+'</lookupValue><!--username-->');
	content = content.replace(new RegExp(`<senderType>.+</senderType>(\s+|)<!--orgwideemail-->`,'g'), '<senderType>CurrentUser</senderType><!--orgwideemail-->');
	fs.writeFileSync(dirfile, content);
}

(function () {
  'use strict';

	module.exports = {
		topic: 'env',
		command: 'resetworkflow',
		description: 'reset workflow ',
		help: 'help text for nab:env:resetworkflow',
		flags: [{
				name: 'orgname',
				char: 'u',
				description: 'name of scratch org',
				hasValue: true
		}],
		run(context) {
			let orgname = context.flags.orgname;
			console.log('Replacing unspported metadata within workflow(s), i.e.: field update on specific user, send email from org wide email...');
			var orginfo = JSON.parse(exec(`sfdx force:org:display -u ${orgname} --json`).toString());
			var currentuser = orginfo.result.username;
			var dirpath = './force-app/main/default/workflows';
			fs.readdirSync(dirpath).forEach(file => {
				console.log(`Updating ${file}...`);
				update_workflows(dirpath+'/'+file,currentuser);
            });
		}
};
}());