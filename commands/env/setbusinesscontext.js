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
		command: 'businesscontext:set',
		description: 'set business context ',
		help: 'help text for nab:env:businesscontext:set',
		flags: [{
				name: 'businesscontext',
				char: 'c',
				description: 'businesscontext',
                hasValue: true,
                require:true
		}],
		run(context) {
			let config = JSON.parse(fs.readFileSync('./config/nab-cli-def.json').toString());
            let businesscontext = context.flags.businesscontext;
            config.currentBusinessContext = businesscontext;
            fs.writeFileSync('./config/nab-cli-def.json',JSON.stringify(config, null, 2));
		}
};
}());