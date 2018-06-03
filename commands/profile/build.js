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
            //profile
            var profilesetting = JSON.parse(fs.readFileSync(profilepath+'/'+profilename+'.json').toString());

            var profile = {
                '@': { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
                'custom' : profilesetting.custom,
                'userLicense' : profilesetting.userLicense
            };

            //classAccess
            profile.classAccesses = [];
            if (fs.existsSync(profilepath+'/classAccesses')) {
                fs.readdirSync(profilepath+'/classAccesses').forEach(file => {
                    profile.classAccesses = JSON.parse(fs.readFileSync(profilepath+'/classAccesses/'+file).toString());
                });
            }
            //customPermissions
            profile.customPermissions = [];
            if (fs.existsSync(profilepath+'/customPermissions')) {
                fs.readdirSync(profilepath+'/customPermissions').forEach(file => {
                    profile.customPermissions.push(JSON.parse(fs.readFileSync(profilepath+'/customPermissions/'+file).toString()));
                });
            }
            //objects
            profile.objectPermissions = [];
            profile.fieldPermissions = [];
            if (fs.existsSync(profilepath+'/objectPermissions')) {
                fs.readdirSync(profilepath+'/objectPermissions').forEach(file => {
                    var objectpath = profilepath+'/objectPermissions/'+file;
                    //objectPermissions
                    if (fs.existsSync(objectpath+'/'+file+'.json')){
                        profile.objectPermissions.push(JSON.parse(fs.readFileSync(objectpath+'/'+file+'.json').toString()));
                    }
                    //fieldPermissions
                    if (fs.existsSync(objectpath+'/fieldPermissions')){
                        fs.readdirSync(objectpath+'/fieldPermissions').forEach(file => {
                            profile.fieldPermissions.push(JSON.parse(fs.readFileSync(objectpath+'/fieldPermissions/'+file).toString()));
                        });
                    }
                    //recordTypeVisibilities
                    if (fs.existsSync(objectpath+'/recordTypeVisibilities')){
                        fs.readdirSync(objectpath+'/recordTypeVisibilities').forEach(file => {
                            profile.recordTypeVisibilities.push(JSON.parse(fs.readFileSync(objectpath+'/recordTypeVisibilities/'+file).toString()));
                        });
                    }
                });
            }
            //layoutAssignments
            profile.layoutAssignments = [];
            if (fs.existsSync(profilepath+'/layoutAssignments')) {
                fs.readdirSync(profilepath+'/layoutAssignments').forEach(file => {
                    profile.layoutAssignments.push(JSON.parse(fs.readFileSync(profilepath+'/layoutAssignments/'+file).toString()));
                });
            }
            //pageAccesses
            profile.pageAccesses = [];
            if (fs.existsSync(profilepath+'/pageAccesses')) {
                fs.readdirSync(profilepath+'/pageAccesses').forEach(file => {
                    profile.pageAccesses.push(JSON.parse(fs.readFileSync(profilepath+'/pageAccesses/'+file).toString()));
                });
            }
            //tabVisibilities
            profile.tabVisibilities = [];
            if (fs.existsSync(profilepath+'/tabVisibilities')) {
                fs.readdirSync(profilepath+'/tabVisibilities').forEach(file => {
                    profile.tabVisibilities.push(JSON.parse(fs.readFileSync(profilepath+'/tabVisibilities/'+file).toString()));
                });
            }
            //userPermissions
            profile.userPermissions = [];
            if (fs.existsSync(profilepath+'/userPermissions')) {
                fs.readdirSync(profilepath+'/userPermissions').forEach(file => {
                    profile.userPermissions.push(JSON.parse(fs.readFileSync(profilepath+'/userPermissions/'+file).toString()));
                });
            }
            //console.log(JSON.stringify(profile,null,2));
            var xml = js2xmlparser.parse("Profile",profile);
            fs.writeFileSync('./force-app/main/default/profiles/'+profilename+'.profile-meta.xml', xml);
            console.log('Profile build successfully!');
        }
    };
}());