const forceUtils = require('../../lib/forceUtils.js');
const exec = require('child_process').execSync;
const path = require('path');
const fs = require('fs');

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
	},{
	  name: 'includepackages',
	  char: 'p',
	  description: 'include packages from cli config file',
	  hasValue: false,
	  required: false
	},{
	  name: 'defaultorg',
	  char: 's',
	  description: 'mark as default org',
	  hasValue: false,
	  required: false
	},{
	  name: 'durationdays',
	  char: 'd',
	  description: 'duration of the scratch org (in days) (default:30, min:1, max:30)',
	  hasValue: true,
	  required: false
	}],
	run(context) {
		let config = JSON.parse(fs.readFileSync('./config/nab-cli.config').toString());

		let orgname = context.flags.orgname;
		let defaultorg = context.flags.defaultorg ? '-s' : '';
		let durationdays = context.flags.durationdays ? context.flags.durationdays : config.defaultdurationdays;

		console.log('Create scratch org...');
		//CREATE SCRATCH ORG
		console.log(exec(`sfdx force:org:create -f config/project-scratch-def.json -a ${orgname} ${defaultorg} -d ${durationdays}`).toString());
		//INSTALL PACKAGES
		if (context.flags.includepackages && config.packages){
			config.packages.forEach(function(elem) {
				console.log(`sfdx force:package:install -i ${elem} -u ${orgname} --json`);
				const stdout = JSON.parse(exec(`sfdx force:package:install -i ${elem} -u ${orgname} --json`).toString());
				const jobid = stdout.result.Id;
				while(true){
			        const stdout = JSON.parse(exec(`sfdx force:package:install:get -i ${jobid} -u ${orgname} --json`).toString());
			        if (stdout.result.Status != 'IN_PROGRESS'){
			        	break;
			        }
			    }
			});
	  	}
	  	//PUSH SOURCE CODE
	  	console.log('Push source to org...');
	  	console.log(exec(`sfdx force:source:push -f -u ${orgname}`).toString());
	  	//TO DO : deploy legacy package
	  	//TO DO : add permission set
	  	//TO DO : import data
	  	console.log(exec(`sfdx force:org:open -u ${orgname}`).toString());
	}
  };
}());