const forceUtils = require('../../lib/forceUtils.js');
const exec = require('child_process').execSync;
const path = require('path');
const fs = require('fs');

function remove_dir(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function (file, index) {
			var curPath = path + "/" + file;
			if (fs.lstatSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
}

function displayOutput() {
	var output = fs.readFileSync('./output.txt');
	console.log(output.toString());
}

function refresh_meta(orgname) {
	var orginfo = JSON.parse(exec(`sfdx force:org:display -u ${orgname} --json`).toString());
	var username = orginfo.result.username;

	remove_dir(`.sfdx/orgs/${username}`);

	// try {
	// 	exec(`sfdx force:mdapi:deploy -u ${orgname} -d config/legacy-packages/destructiveChanges/deactivateflows -w 60`);
	// } catch (err) {
	// 	console.log('No flow to deactivate...');
	// }
	console.log(exec(`sfdx nab:env:resetworkflow -u ${orgname}`).toString());

	try {
		exec(`sfdx force:source:push -f -u ${orgname} -w 60 > output.txt`);
	} catch (err) { }
	displayOutput();
}

(function () { //immediately invoked function expression (iife)
	'use strict';

	module.exports = {
		topic: 'env',
		command: 'refresh',
		description: 'Refresh metadata',
		help: 'help text for nab:env:refresh',
		flags: [{
			name: 'orgname',
			char: 'u',
			description: 'name of scratch org',
			hasValue: true
		}],
		run(context) {
			var alias = context.flags.orgname ? '-u' : '';
			var orgToRefresh;

			if (alias == '') {
				console.log('No org indicated in command, refreshing default scratch org');
				var display = JSON.parse(exec(`sfdx force:org:display --json`).toString());
				orgToRefresh=display.result.username
			} else {
				orgToRefresh=context.flags.orgname;
			}

			//REFRESH SOURCE
			refresh_meta(orgToRefresh);

			fs.unlinkSync('./output.txt');	


		}
	};
}());