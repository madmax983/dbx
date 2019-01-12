const exec = require('child_process').execSync;
const path = require('path');
const fs = require('fs');
const util = require('data-seed').util;
const seed = require('data-seed').seed;

function displayOutput(){
	if (fs.existsSync('./output.txt')){
		var output = fs.readFileSync('./output.txt');
		console.log(output.toString());
	}
}

function export_data(sourceorg){
	let config = JSON.parse(fs.readFileSync('./config/dbx-cli-def.json').toString());
	if (config.transfer_soql_queries){
		config.transfer_soql_queries.forEach (function(elem) {
			if (elem.active){
				console.log(exec(`sfdx force:data:tree:export -p -q "${elem.query}" -d ./config/setup-data/transfer/${elem.folder} -u ${sourceorg}`).toString());
			}
		});
	}
}

function import_data(targetorg){
	let config = JSON.parse(fs.readFileSync('./config/dbx-cli-def.json').toString());
	if (config.transfer_soql_queries){
		config.transfer_soql_queries.forEach (function(elem) {
			if (elem.active){
				try{
					if (elem.recordtype){
						console.log('Defining record type : '+elem.recordtype);
						updateRecordType(targetorg,elem);
					}
					if (elem.transformations){
						transform_data(elem);
					}
					//replace recordtype in output files
					console.log(`Import ./config/setup-data/transfer/${elem.folder}/${elem.filename} to ${targetorg}...`);
					exec(`sfdx force:data:tree:import -p ./config/setup-data/transfer/${elem.folder}/${elem.filename} -u ${targetorg} > output.txt`);
				}catch(err){
					console.log('Something went wrong!');
					console.log(err);
				}
				displayOutput();
				//delete source data for security reason
				//fs.unlinkSync(`./config/setup-data/transfer/${elem.folder}/${elem.sobject}s.json`);
			}
		});
	}	
}

function transform_data(file){
	let parentrecords = JSON.parse(fs.readFileSync(`./config/setup-data/transfer/${file.folder}/${file.sobject}s.json`).toString());
	if (parentrecords && parentrecords.records){
		parentrecords.records.forEach(function(rec){
			file.transformations.forEach(function(rule){
				if (rule.type === 'text'){
					rec[rule.targetField] = rule.formula;	
				}else if (rule.type === 'random_lastname'){
					rec[rule.targetField] = seed.name.en.lastName();
				}else if (rule.type === 'random_firstname'){
					rec[rule.targetField] = seed.name.en.firstName();
				}else if (rule.type === 'random_email'){
					rec[rule.targetField] = seed.email();
				}else{
					rec[rule.targetField] = seed.name();
				}
			});
		});
	}
	fs.writeFileSync(`./config/setup-data/transfer/${file.folder}/${file.sobject}s.json`,JSON.stringify(parentrecords,null,2));
}

function updateRecordType(targetorg, file){
	var res = JSON.parse(exec(`sfdx force:data:soql:query -u ${targetorg} -q "SELECT Id FROM Recordtype WHERE SObjectType = '${file.sobject}' AND DeveloperName = '${file.recordtype}'" --json`).toString());
	var recordtypeid = res.result.records[0].Id;
	console.log(recordtypeid);
	let parentrecords = JSON.parse(fs.readFileSync(`./config/setup-data/transfer/${file.folder}/${file.sobject}s.json`).toString());
	if (parentrecords && parentrecords.records){
		parentrecords.records.forEach(function(elem){
			elem.RecordTypeId = recordtypeid;
		});
	}
	fs.writeFileSync(`./config/setup-data/transfer/${file.folder}/${file.sobject}s.json`,JSON.stringify(parentrecords,null,2));
}

(function () {
  'use strict';

	module.exports = {
		topic: 'data',
		command: 'transfer',
		description: 'transfer data between org, check dbx-cli-def.json to set queries',
		help: 'help text for dbx:data:transfer',
		flags: [{
				name: 'orgname',
				char: 'u',
				description: 'target sandbox',
				hasValue: true
		},{
				name: 'source',
				char: 's',
				description: 'source sandbox',
				hasValue: true
		}],
		run(context) {
			let source = context.flags.source;
			let orgname = context.flags.orgname;

			export_data(source);
			import_data(orgname);

			fs.unlinkSync('./output.txt');
			console.log(exec(`sfdx force:org:display -u ${orgname}`).toString());
			console.log('\x1b[91m%s\x1b[0m', `Data tranferred completed!`);
		}
};
}());