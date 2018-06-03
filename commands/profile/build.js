const path = require('path');
const fse = require('fs-extra');
const fs = require('fs');
const os = require('os');
var js2xmlparser = require('js2xmlparser');

(function() {

    'use strict';

    module.exports = {
        topic: 'profile',
        command: 'build',
        description: 'Build profile into xml',
        help: 'help text for dbx:profile:build',
        flags: [{
            name: 'profilename',
            char: 'p',
            description: 'convert specified profile',
            hasValue: true,
            required: false
        }],

        run(context) {
            let profilename = context.flags.profilename;
            var profilepath = './force-app/main/default/profiles/'+profilename;
            var profile = {};

            //classAccess
            profile.classAccesses = [];
            if (fs.existsSync(profilepath+'/classAccesses')) {
                fs.readdirSync(profilepath+'/classAccesses').forEach(file => {
                    profile.classAccesses = JSON.parse(fs.readFileSync(profilepath+'/classAccesses/'+file).toString());
                });
            }
            //objectPermissions
            profile.objectPermissions = [];
            if (fs.existsSync(profilepath+'/objectPermissions')) {
                fs.readdirSync(profilepath+'/objectPermissions').forEach(file => {
                    profile.objectPermissions.push(JSON.parse(fs.readFileSync(profilepath+'/objectPermissions/'+file).toString()));
                });
            }
            //layoutAssignments
            profile.layoutAssignments = [];
            if (fs.existsSync(profilepath+'/layoutAssignments')) {
                fs.readdirSync(profilepath+'/layoutAssignments').forEach(file => {
                    profile.layoutAssignments.push(JSON.parse(fs.readFileSync(profilepath+'/layoutAssignments/'+file).toString()));
                });
            }
            //userPermissions
            profile.userPermissions = [];
            if (fs.existsSync(profilepath+'/userPermissions')) {
                fs.readdirSync(profilepath+'/userPermissions').forEach(file => {
                    profile.userPermissions.push(JSON.parse(fs.readFileSync(profilepath+'/userPermissions/'+file).toString()));
                });
            }
            console.log(JSON.stringify(profile,null,2));
            var xml = js2xmlparser.parse("Profile",profile);
            console.log(xml);
        }
    };
}());