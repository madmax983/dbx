const path = require('path');
const fse = require('fs-extra');
const fs = require('fs');
const os = require('os');
var xml2js = require('xml2js');

function convertProfile(profilename){
    var profilepath = './force-app/main/default/profiles/'+profilename;
    fs.readFile(`${profilepath}.profile-meta.xml`, function(err, data) {
        if (!fs.existsSync(profilepath)) {
            fs.mkdirSync(profilepath);
        }
        console.log(`${profilepath}.profile-meta.xml`);
        var parser = new xml2js.Parser( {"explicitArray":false});
        parser.parseString(data,function (err, result) {
                //profile
                fs.writeFileSync(profilepath+'/'+profilename+'.json', JSON.stringify({
                    "custom" : result.Profile.custom,
                    "userLicense" : result.Profile.userLicense
                }, null, 2));
                //classAccesses
                if (!result){
                    console.log(`Could not split ${profilename}`);
                    return;
                }
                //applicationVisibilities
                if (result.Profile.applicationVisibilities){
                    if (!fs.existsSync(profilepath+'/applicationVisibilities')) {
                        fs.mkdirSync(profilepath+'/applicationVisibilities');
                    }
                    if (!Array.isArray(result.Profile.applicationVisibilities)){
                        result.Profile.applicationVisibilities = [result.Profile.applicationVisibilities];
                    }
                    result.Profile.applicationVisibilities.forEach(function(elem){
                        fs.writeFileSync(profilepath+'/applicationVisibilities/'+elem.application+'.json', JSON.stringify(elem, null, 2));
                    });
                }
                //classAccesses
                if (result.Profile.classAccesses){
                    if (!fs.existsSync(profilepath+'/classAccesses')) {
                        fs.mkdirSync(profilepath+'/classAccesses');
                    }
                    if (!Array.isArray(result.Profile.classAccesses)){
                        result.Profile.classAccesses = [result.Profile.classAccesses];
                    }
                    result.Profile.classAccesses.forEach(function(elem){
                        fs.writeFileSync(profilepath+'/classAccesses/'+elem.apexClass+'.json', JSON.stringify(elem, null, 2));
                    });
                }
                //objectPermissions
                if (result.Profile.objectPermissions){
                    if (!fs.existsSync(profilepath+'/objectPermissions')) {
                        fs.mkdirSync(profilepath+'/objectPermissions');
                    }
                    if (!Array.isArray(result.Profile.objectPermissions)){
                        result.Profile.objectPermissions = [result.Profile.objectPermissions];
                    }
                    result.Profile.objectPermissions.forEach(function(elem){
                        if (!fs.existsSync(profilepath+'/objectPermissions/'+elem.object)) {
                            fs.mkdirSync(profilepath+'/objectPermissions/'+elem.object);
                        } 
                        fs.writeFileSync(profilepath+'/objectPermissions/'+elem.object+'/'+elem.object+'.json', JSON.stringify(elem, null, 2));
                    });
                }
                //fieldPermissions
                if (result.Profile.fieldPermissions){
                    if (!fs.existsSync(profilepath+'/objectPermissions')) {
                        fs.mkdirSync(profilepath+'/objectPermissions');
                    }
                    if (!Array.isArray(result.Profile.fieldPermissions)){
                        result.Profile.fieldPermissions = [result.Profile.fieldPermissions];
                    }
                    result.Profile.fieldPermissions.forEach(function(elem){
                        var objectName = elem.field.split('.')[0];
                        if (!fs.existsSync(profilepath+'/objectPermissions/'+objectName)) {
                            fs.mkdirSync(profilepath+'/objectPermissions/'+objectName);
                        }  
                        if (!fs.existsSync(profilepath+'/objectPermissions/'+objectName+'/fieldPermissions')) {
                            fs.mkdirSync(profilepath+'/objectPermissions/'+objectName+'/fieldPermissions');
                        }   
                        fs.writeFileSync(profilepath+'/objectPermissions/'+objectName+'/fieldPermissions/'+elem.field+'.json', JSON.stringify(elem, null, 2));
                    });
                }
                //recordTypeVisibilities
                if (result.Profile.recordTypeVisibilities){
                    if (!fs.existsSync(profilepath+'/objectPermissions')) {
                        fs.mkdirSync(profilepath+'/objectPermissions');
                    }
                    if (!Array.isArray(result.Profile.recordTypeVisibilities)){
                        result.Profile.recordTypeVisibilities = [result.Profile.recordTypeVisibilities];
                    }
                    result.Profile.recordTypeVisibilities.forEach(function(elem){
                        var objectName = elem.recordType.split('.')[0];
                        if (!fs.existsSync(profilepath+'/objectPermissions/'+objectName)) {
                            fs.mkdirSync(profilepath+'/objectPermissions/'+objectName);
                        }  
                        if (!fs.existsSync(profilepath+'/objectPermissions/'+objectName+'/recordTypeVisibilities')) {
                            fs.mkdirSync(profilepath+'/objectPermissions/'+objectName+'/recordTypeVisibilities');
                        }   
                        fs.writeFileSync(profilepath+'/objectPermissions/'+objectName+'/recordTypeVisibilities/'+elem.recordType+'.json', JSON.stringify(elem, null, 2));
                    });
                }
                //customPermissions
                if (result.Profile.customPermissions){
                    if (!fs.existsSync(profilepath+'/customPermissions')) {
                        fs.mkdirSync(profilepath+'/customPermissions');
                    }
                    if (!Array.isArray(result.Profile.customPermissions)){
                        result.Profile.customPermissions = [result.Profile.customPermissions];
                    }
                    result.Profile.customPermissions.forEach(function(elem){
                        fs.writeFileSync(profilepath+'/customPermissions/'+elem.name+'.json', JSON.stringify(elem, null, 2));
                    });
                }
                //pageAccesses
                if(result.Profile.pageAccesses){
                    if (!fs.existsSync(profilepath+'/pageAccesses')) {
                        fs.mkdirSync(profilepath+'/pageAccesses');
                    }
                    if (!Array.isArray(result.Profile.pageAccesses)){
                        result.Profile.pageAccesses = [result.Profile.pageAccesses];
                    }
                    result.Profile.pageAccesses.forEach(function(elem){
                        fs.writeFileSync(profilepath+'/pageAccesses/'+elem.apexPage+'.json', JSON.stringify(elem, null, 2));
                    });
                }
                //tabVisibilities
                if (result.Profile.tabVisibilities){
                    if (!fs.existsSync(profilepath+'/tabVisibilities')) {
                        fs.mkdirSync(profilepath+'/tabVisibilities');
                    }
                    if (!Array.isArray(result.Profile.tabVisibilities)){
                        result.Profile.tabVisibilities = [result.Profile.tabVisibilities];
                    }
                    result.Profile.tabVisibilities.forEach(function(elem){
                        fs.writeFileSync(profilepath+'/tabVisibilities/'+elem.tab+'.json', JSON.stringify(elem, null, 2));
                    });
                }
                //layoutAssignments
                if (result.Profile.layoutAssignments){
                    if (!fs.existsSync(profilepath+'/layoutAssignments')) {
                        fs.mkdirSync(profilepath+'/layoutAssignments');
                    }
                    if (!Array.isArray(result.Profile.layoutAssignments)){
                        result.Profile.layoutAssignments = [result.Profile.layoutAssignments];
                    }
                    result.Profile.layoutAssignments.forEach(function(elem){
                        fs.writeFileSync(profilepath+'/layoutAssignments/'+elem.layout+'.json', JSON.stringify(elem, null, 2));
                    });
                }
                //userPermissions
                if (result.Profile.userPermissions){
                    if (!fs.existsSync(profilepath+'/userPermissions')) {
                        fs.mkdirSync(profilepath+'/userPermissions');
                    }
                    if (!Array.isArray(result.Profile.userPermissions)){
                        result.Profile.userPermissions = [result.Profile.userPermissions];
                    }
                    result.Profile.userPermissions.forEach(function(elem){
                        fs.writeFileSync(profilepath+'/userPermissions/'+elem.name+'.json', JSON.stringify(elem, null, 2));
                    });
                }
        });
        
    });
}

(function() {

    'use strict';

    module.exports = {
        topic: 'profile',
        command: 'convert',
        description: 'Create custom label',
        help: 'help text for dbx:profile:convert',
        flags: [{
            name: 'profilename',
            char: 'p',
            description: 'convert specified profile',
            hasValue: true,
            required: false
        }],

        run(context) {
            var profilename = context.flags.profilename;
            if (profilename){
                try{
                    convertProfile(profilename);    
                }catch(err){
                    console.log(`Could not split ${profilename}`);
                }
            }else{
                fs.readdirSync('./force-app/main/default/profiles').forEach(file => {
                    if (file.indexOf('profile-meta.xml') >= 0){
                        profilename = file.split('.')[0];
                        try{
                            convertProfile(profilename);
                        }catch(err){
                            console.log(`Could not split ${profilename}`);
                        }
                    }
                });
            }
            console.log('Profile(s) parse to json files successfully!');
        }
    };
}());