const exec = require('child_process').execSync;
const fs = require('fs');

function saveRuntime(config) {
        fs.writeFileSync("./config/nab-cli-def.json", config, function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    }
    (function() {
        'use strict';
        module.exports = {
            topic: 'env',
            command: 'backup',
            description: 'Perform data backup of target environment',
            help: 'help text for dbx:env:backup',
            flags: [{
                name: 'orgname',
                char: 'u',
                description: 'name of scratch org',
                hasValue: true
            }, {
                name: 'outputdir',
                char: 'd',
                description: 'output directory path to store files',
                hasValue: true
            }, {
                name: 'delta',
                char: 'm',
                description: 'Backup data since last runtime',
                hasValue: true
            }, {
                name: 'resultformat',
                char: 'r',
                description: 'format of the output files: csv(default), xml, or json',
                hasValue: true
            }],
            run(context) {
                var config = JSON.parse(fs.readFileSync('./config/nab-cli-def.json').toString());
                let orgname = context.flags.orgname;
                let resultformat = context.flags.resultformat !== undefined ? context.flags.resultformat : 'csv';
                let isdelta = context.flags.delta !== undefined;
                console.log('\x1b[91m%s\x1b[0m', 'Start backing up ' + orgname + ' environment...');
                const stdout = JSON.parse(exec(`sfdx force:schema:sobject:list -c all -u ${orgname} --json`));
                const totalObjects = stdout.result.length;
                let count = 0;
                const now = new Date();
                const dirpath = './backup/nabcrm_' + now.getFullYear() + '' + (now.getMonth() + 1) + '' + now.getDate() + '' + now.getHours() + '' + now.getMinutes();
                fs.mkdirSync(dirpath);
                stdout.result.forEach(function(obj) {
                    count++;
                    console.log('Step ' + count + ' out of ' + totalObjects + ' [' + obj + ']');
                    var object = JSON.parse(exec(`sfdx force:schema:sobject:describe -s ${obj} -u ${orgname} --json`).toString());
                    if (object.result.queryable) {
                        var query = "SELECT Id";
                        object.result.fields.forEach(function(f) {
                            if (!f.deprecatedAndHidden && f.name !== 'Id') query = query + "," + f.name;
                        });
                        query = query + " FROM " + obj;
                        if (isdelta) query = query + " WHERE LastModifiedDate >= '" + config.backup.lastbackupdatetime + "'";
                        try {
                            console.log(query.substring(0, 100) + '...');
                            if (config.backup.bulkapiobjects.indexOf(obj) > -1) { //object is a in bulk api ?
                                //to do (see example below)
                            } else {
                                console.log('...');
                                exec(`sfdx force:data:soql:query -q "${query}" -r ${resultformat} > ${dirpath}/${obj}.${resultformat}`).toString();
                            }
                        } catch (err) {
                            console.log(err);
                        }
                    }
                });
                config.backup.lastbackupdatetime = new Date().toISOString();
                console.log(config);
                saveRuntime(JSON.stringify(config, null, '\t'));
            }
        };
    }());