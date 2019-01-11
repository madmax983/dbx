
const forceUtils = require('../../lib/forceUtils.js');
const exec = require('child_process').execSync;
const path = require('path');
const fs = require('fs');


function displayOutput(){
	var output = fs.readFileSync('./output.txt');
	console.log(output.toString());
}

function git_pull(){
	console.log(exec(`git fetch --all -p`).toString());
	console.log(exec(`git pull --no-commit origin develop`).toString());
}	

function update_workflows1(orgname){
	console.log('Replacing integration username within workflow(s) to scratch org user...');
	var orginfo = JSON.parse(exec(`sfdx force:org:display -u ${orgname} --json`).toString());
	var username = orginfo.result.username;
	let content = fs.readFileSync('./force-app/main/default/workflows/Account.workflow-meta.xml').toString();
	content = content.replace(new RegExp(`<lookupValue>.+</lookupValue><!--username-->`,'g'), '<lookupValue>'+username+'</lookupValue><!--username-->');
	fs.writeFileSync('./force-app/main/default/workflows/Account.workflow-meta.xml', content);
}

function update_workflows2(){
	console.log('Replacing org wide email by curret user in case workflow...');
	let content = fs.readFileSync('./force-app/main/default/workflows/Case.workflow-meta.xml').toString();
	content = content.replace(new RegExp(`<senderType>.+</senderType><!--orgwideemail-->`,'g'), '<senderType>CurrentUser</senderType><!--orgwideemail-->');
	fs.writeFileSync('./force-app/main/default/workflows/Case.workflow-meta.xml', content);
}

function push_source(orgname){
	console.log('Push source to org...'); 
	try{
		exec(`sfdx force:source:push -g -f -u ${orgname} > output.txt`); 
	}catch(err){}	
	displayOutput();
}

(function () {
  'use strict';

	module.exports = {
		topic: 'env',
		command: 'sync',
		description: 'git pull origin develop + sfdx push',
		help: 'help text for nab:env:sync',
		flags: [{
				name: 'orgname',
				char: 'u',
				description: 'name of scratch org',
				hasValue: true
		}],
		run(context) {
				let orgname = context.flags.orgname;

				//GIT PULL
				git_pull(orgname);

				//UPDATE WORKFLOW
				update_workflows1(orgname);
				update_workflows2();
				
				//PUSH DX SOURCE
				push_source(orgname);

				fs.unlinkSync('./output.txt');
				console.log(exec(`sfdx force:org:display -u ${orgname}`).toString());
				console.log('\x1b[91m%s\x1b[0m', `Thank you for your patience! You can now enjoy your scrath org. Happy coding!`);
		}
};
}());