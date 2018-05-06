const forceUtils = require('../../lib/forceUtils.js');

const exec = require('child_process').execSync;

const path = require('path');

const fs = require('fs');

 

function displayOutput(){

    var output = fs.readFileSync('./output.txt');

    console.log(output.toString());

}

 

function create_scratch_org(orgname, defaultorg, durationdays){

    try{

        exec(`sfdx force:org:delete -p -u ${orgname}`);

    }catch(err){}

 

    console.log(exec(`sfdx force:org:create -f config/project-scratch-def.json -a ${orgname} ${defaultorg} -d ${durationdays}`).toString());

}

 

function deploy_legacy_packages(orgname, legacy_packages,type){

    console.log(`Installing your ${type} legacy packages...`);

    legacy_packages.forEach(function(elem) {

        console.log(exec(`sfdx force:mdapi:deploy -f config/legacy-packages/${type}/${elem}/${elem}.zip -u ${orgname} -w 60`).toString());

    });

}

 

function prompt_user_manual_config(orgname, manual_steps){

    console.log('Due to some limitations with DX scratch org, you must enable manually the following feature(s) before to proceed:');

    manual_steps.forEach(function(elem) {

        console.log(elem);

    });

    console.log(exec(`sfdx force:org:open -u ${orgname} -p one/one.app#/setup/AccountSettings/home`).toString());

 

    var stdin = require('readline-sync');

    while(true) {

        var yn = stdin.question("Would you like to continue?(Y/N)");

        if(yn === 'y') {

                break;

        } else {

                process.exit();

        }

    }

}

 

function install_packages(orgname, packages){

    console.log('Installing your (un)managed packages...');

    packages.forEach(function(elem) {

            console.log(`sfdx force:package:install -i ${elem} -u ${orgname} --json`);

            console.log(exec(`sfdx force:package:install -i ${elem} -u ${orgname} -w 60`).toString());

    });

}

 

function update_workflows(orgname){

    console.log('Replacing integration username within workflow(s) to scratch org user...');

    var orginfo = JSON.parse(exec(`sfdx force:org:display -u ${orgname} --json`).toString());

    var username = orginfo.result.username;

    let content = fs.readFileSync('./force-app/main/default/workflows/Account.workflow-meta.xml').toString();

    content = content.replace(new RegExp(`<lookupValue>och.integration@nabcrm.au</lookupValue>`,'g'), '<lookupValue>'+username+'</lookupValue>');

    fs.writeFileSync('./force-app/main/default/workflows/Account.workflow-meta.xml', content);

}

 

function push_source(orgname){

    console.log('Push source to org...');

    try{

        console.log(exec(`sfdx force:source:push -g -f -u ${orgname} > output.txt`).toString());

    }catch(err){}   

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

        description: 'Create dbx standard scratch org',

        help: 'help text for dbx:env:create',

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

        }],

        run(context) {

                let config = JSON.parse(fs.readFileSync('./config/nab-cli-def.json').toString());

 

                let orgname = context.flags.orgname;

                let defaultorg = context.flags.defaultorg ? '-s' : '';

                let durationdays = context.flags.durationdays ? context.flags.durationdays : config.defaultdurationdays;  

                console.log('\x1b[91m%s\x1b[0m', `Welcome to NAB DX! We are now creating your scratch org[${orgname}]...`);

                

                create_scratch_org(orgname, defaultorg, durationdays);

 

                //REMOVE INTEGRATION USER FROM WORKFLOW FIELD UPDATE

                update_workflows(orgname);

                

                //DEPLOY PRE LEGACY PACKAGES

                if (config.pre_legacy_packages) {

                    deploy_legacy_packages(orgname, config.pre_legacy_packages, 'pre');

                }

 

                if (config.manual_config_required){

                    //STOP USER FOR MANUAL CONFIG

                    prompt_user_manual_config(orgname, config.manual_steps);

                }

 

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