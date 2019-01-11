const forceUtils = require('../../lib/forceUtils.js');
const exec = require('child_process').execSync;
const path = require('path');
const fs = require('fs');


function displayOutput(){
	var output = fs.readFileSync('./output.txt');
	console.log(output.toString());
}

function git_pull(){
	console.log(exec(`git pull origin/develop`).toString());
}

function git_checkout(orgname){
	var stdin = require('readline-sync');

	var yn = stdin.question("But before that, would you like to create a new fresh new branch from origin/develop?(Y/N)");
	if(yn === 'y') {
		console.log(exec(`git fetch --all; git checkout -b ${orgname} origin/develop`).toString());
		git_pull();
	}
}

function create_scratch_org(orgname, defaultorg, durationdays){
	console.log(`sfdx force:org:create -f config/project-scratch-def.json -a ${orgname} ${defaultorg} -d \"${durationdays}\"`);
	console.log(exec(`sfdx force:org:create -f config/project-scratch-def.json -a ${orgname} ${defaultorg} -d \"${durationdays}\"`).toString());
}

function deploy_legacy_packages(orgname, legacy_packages,type){
	console.log(`Installing your ${type} legacy packages...`);
	legacy_packages.forEach(function(elem) {
		try{
			exec(`sfdx force:mdapi:deploy --deploydir config/legacy-packages/${type}/${elem} -u ${orgname} -w 60 > output.txt`);
		}catch(err){}
		displayOutput();
	});
}

function prompt_user_manual_config(orgname, manual_steps){
	console.log('Due to some limitations with DX scratch org, you must enable manually the following feature(s) before to proceed:');
	manual_steps.forEach(function(elem) {
		console.log(elem);
	});
	console.log(exec(`sfdx force:org:open -u ${orgname} -p /lightning/setup/ObjectManager/Account/FieldsAndRelationships/setHistoryTracking`).toString());

	var stdin = require('readline-sync');
	while(true) {
		var yn = stdin.question("Would you like to continue?(Y/N)");
		if(yn.toLowerCase() === 'y' ) {
			break;
		} else {
			process.exit();
		}
	}
}

function manuallyEnableTerritoryManagement(orgname) {
	console.log('Due to some limitations with scratch orgs in DX, you must manually enable Territory Management:');

	console.log(exec(`sfdx force:org:open -u ${orgname} -p /lightning/setup/Territory2Settings/home`).toString());
	var stdin = require('readline-sync');
	while(true) {
		var yn = stdin.question("Would you like to continue?(Y/N)");
		if(yn.toLowerCase() === 'y' ) {
			break;
		} else {
			process.exit();
		}
	}
}

function includetrackinghistory(disableFeedTrackingObjects){
	disableFeedTrackingObjects.forEach(function(elem) {
		console.log(`Disabling Feed Tracking History for ${elem}`);
		removeFeedTrackingHistoryInObject(elem);
	});
}

function removeFeedTrackingHistoryInObject(objectName){
	var objectPath = `./force-app/main/default/objects/${objectName}/${objectName}.object-meta.xml`;
	var content = fs.readFileSync(objectPath).toString();
	content = content.replace(new RegExp(`<enableHistory>.+</enableHistory>`,'g'), '<enableHistory>false</enableHistory>');
	fs.writeFileSync(objectPath, content);

	removeFeedTrackingHistoryInField(objectName);
}

function removeFeedTrackingHistoryInField(objectName){
	var objectPath = `./force-app/main/default/objects/${objectName}/fields`;
	fs.readdirSync(objectPath).forEach(file => {
		var content = fs.readFileSync(objectPath+'/'+file).toString();
		content = content.replace(new RegExp(`<trackHistory>.+</trackHistory>`,'g'), '');
		fs.writeFileSync(objectPath+'/'+file, content);
    });
}

function install_packages(orgname, packages){
	console.log('Installing your (un)managed packages...');
	packages.forEach(function(elem) {
		console.log(`sfdx force:package:install --package ${elem} -u ${orgname} --json`);
		console.log(exec(`sfdx force:package:install --package ${elem} -u ${orgname} -w 60`).toString());
	});
}

function push_source(orgname){
	console.log('Push source to org...'); 
	try{
		exec(`sfdx force:source:push -g -f -u ${orgname} > output.txt`); 
	}catch(err){}	
	displayOutput();
}

function create_user(orgname, user_alias_prefix,user_def_file){
	const suffix = Math.floor((Math.random() * 20000000) + 1);
	if (!user_alias_prefix) user_alias_prefix = 'usr';
	try{
		exec(`sfdx force:user:create --setalias ${user_alias_prefix}-${orgname} --definitionfile ${user_def_file} username=user.${suffix}@nab-test.${orgname} -u ${orgname} > output.txt`);
	}catch(err){}
	displayOutput();
}

(function () {
  'use strict';

	module.exports = {
		topic: 'env',
		command: 'create',
		description: 'Create nab standard scratch org',
		help: 'help text for nab:env:create',
		flags: [{
				name: 'orgname',
				char: 'u',
				description: 'name of scratch org',
				hasValue: true
		}, {
				name: 'includepackages',
				char: 'p',
				description: 'include packages from cli config file',
				hasValue: false,
				required: false
		}, {
				name: 'defaultorg',
				char: 's',
				description: 'mark as default org',
				hasValue: false,
				required: false
		}, {
				name: 'durationdays',
				char: 'd',
				description: 'duration of the scratch org (in days) (default:30, min:1, max:30)',
				hasValue: true,
				required: false
		},{
				name: 'includedata',
				char: 'f',
				description: 'indicate if nab data need to be imported',
				hasValue: false,
				required: false
		},{
				name: 'gitpull',
				char: 'g',
				description: 'git pull from develop',
				hasValue: false,
				required: false
		},{
				name: 'includetrackinghistory',
				char: 't',
				description: 'remove field tracking history tag from Account, Contact, Lead',
				hasValue: false,
				required: false	
		}],
		run(context) {
				let config = JSON.parse(fs.readFileSync('./config/nab-cli-def.json').toString());

				let orgname = context.flags.orgname;
				let defaultorg = context.flags.defaultorg ? '-s' : '';
				let durationdays = context.flags.durationdays ? context.flags.durationdays : config.defaultdurationdays;   
				console.log('\x1b[91m%s\x1b[0m', `Welcome to NAB DX! We are now creating your scratch org[${orgname}]...`);
				if (context.flags.gitpull) git_pull();
				
				create_scratch_org(orgname, defaultorg, durationdays);

				//UPDATE WORKFLOWS
				console.log(exec(`sfdx nab:env:resetworkflow -u ${orgname}`).toString());

				//DEPLOY PRE LEGACY PACKAGES
				if (config.pre_legacy_packages) {
					deploy_legacy_packages(orgname, config.pre_legacy_packages, 'pre');
				}

				//REMOVE FIELDS TRACKING HISTORY
				if (context.flags.includetrackinghistory) {
					includetrackinghistory(config.disableFeedTrackingHistory);
				} else if (config.manual_config_required){
					//STOP USER FOR MANUAL CONFIG
					prompt_user_manual_config(orgname, config.manual_steps);
				}

				//ENABLE TERRITORY MANAGEMENT
				manuallyEnableTerritoryManagement(orgname); 

				//INSTALL PACKAGES
				if (context.flags.includepackages && config.packages) {
					install_packages(orgname, config.packages);
				}
				
				//PUSH DX SOURCE
				push_source(orgname);
				
				//DEPLOY POST LEGACY PACKAGES
				if (config.post_legacy_packages) {
					deploy_legacy_packages(orgname, config.post_legacy_packages, 'post');
				}
				//create other user, this also fix FLS being deleted from profile
				if (config.user_def_file){
					create_user(orgname, config.user_alias_prefix, config.user_def_file);
				}
				fs.unlinkSync('./output.txt');
				console.log(exec(`sfdx force:org:display -u ${orgname}`).toString());
				console.log('\x1b[91m%s\x1b[0m', `Thank you for your patience! You can now enjoy your scrath org. Happy coding!`);
		}
};
}());