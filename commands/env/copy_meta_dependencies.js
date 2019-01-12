const fs = require("fs-extra");
const path = require('path');
const exec = require('child_process').execSync;

const extensions = {
	"classes": {
		"cls" : "cls-meta.xml",
		"cls-meta.xml" : "cls"
	},
	"triggers": {
		"trigger" : "trigger-meta.xml",
		"trigger-meta.xml" : "trigger"
	},
	"pages": {
		"page" : "page-meta.xml",
		"page-meta.xml" : "page"
	},
	"objects": {
		"field-meta.xml" : "../..",
		"fieldSet-meta.xml" : "../..",
		"listView-meta.xml" : "../..",
		"recordType-meta.xml" : "../..",
		"validationRule-meta.xml" : "../..",
		"compactLayout-meta.xml" : "../.."
	},
	"objectTranslations": {
		"fieldTranslation-meta.xml" : ".."
	},
	"contentassets": {
		"asset" : "asset-meta.xml",
		"asset-meta.xml" : "asset"
	},
	"aura" : {
		"app" : "..",
		"app-meta.xml" : "..",
		"cmp" : "..",
		"cmp-meta.xml" : "..",
		"js" : "..",
		"css" : "..",
		"evt" : "..",
		"evt-meta.xml" : ".."
	},
	"email" : {
		"email" : "email-meta.xml",
		"email-meta.xml" : "email"
	},
	"staticresources" : {
		"any" : "resource-meta.xml",
		"resource-meta.xml" : "any"
	}
};


function copyFileSync( source, target ) {

    var targetFile = target;

    //if target is a directory a new file with the same name will be created
    if ( fs.existsSync( target ) ) {
        if ( fs.lstatSync( target ).isDirectory() ) {
            targetFile = path.join( target, path.basename( source ) );
        }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync( source, target ) {
    var files = [];

    //check if folder needs to be created or integrated
    var targetFolder = path.join( target, path.basename( source ) );
    if ( !fs.existsSync( targetFolder ) ) {
        fs.ensureDirSync( targetFolder );
    }

    //copy
    if ( fs.lstatSync( source ).isDirectory() ) {
        files = fs.readdirSync( source );
        files.forEach( function ( file ) {
            var curSource = path.join( source, file );
            if ( fs.lstatSync( curSource ).isDirectory() ) {
                copyFolderRecursiveSync( curSource, targetFolder );
            } else {
                copyFileSync( curSource, targetFolder );
            }
        } );
    }
}
//removeUnsupportedUserPermissions('./force-app/main/default/profiles');
//removeUnsupportedUserPermissions('./force-app/main/default/permissionsets');
function removeUnsupportedUserPermissions(folder,userpermissions){
	fs.readdirSync(folder).forEach(file => {

		processFile(path.join(folder,file),userpermissions);

	});
}

function processFile(filepath,userpermissions){
	console.log(filepath);
    fs.readFile(filepath, function(err, data) {
		data = data.toString();
		userpermissions.forEach(perm => {
			var regex = `<userPermissions>\n\s.+\n\s+<name>${perm}<\/name>\n\s+<\/userPermissions>`;
			console.log(regex);
			data = data.replace(new RegExp(regex,'g'), '');
			fs.writeFileSync(filepath, data);
		});
	});
}


(function () {
  'use strict';

	module.exports = {
		topic: 'delta',
		command: 'meta:depend:copy',
		description: 'command to copy metadata dependencies for delta deployment',
		help: 'help text for dbx:delta:meta:depend:copy',
		flags: [{
				name: 'targetdir',
				char: 'r',
				description: 'delta|acc_delta|...',
				hasValue: true,
				required: true
			},{
				name: 'mode',
				char: 'm',
				description: 'commitid(default)|tags',
				hasValue: true,
				required: false
			},{
				name: 'commitid',
				char: 'c',
				description: 'commit #',
				hasValue: true,
				required: false
			},{
				name: 'prevTag',
				char: 'p',
				description: 'tag # to HEAD',
				hasValue: true,
				required: false
			}],
		run(context) {
			removeUnsupportedUserPermissions('./force-app/main/default/profiles',['ManageMobile']);
			/*
			var commitid = context.flags.commitid;
			var mode = context.flags.mode;
			var prevTag = context.flags.prevTag;
			var targetdir = context.flags.targetdir;

			if (!fs.existsSync(targetdir)){ 
				fs.mkdirSync(targetdir);
			}
			fs.copyFileSync('sfdx-project.json',path.join(targetdir,'sfdx-project.json')); 
			fs.copyFileSync('.forceignore',path.join(targetdir,'.forceignore')); 

			//git diff-tree --no-commit-id --name-only -r 2d9dc0fd1f5148b9f4dac23215c4aaaae64c1ab1
			var files;
			if (mode === 'tags'){
				if (commitid) {
					files = exec(`git show ${commitid}..HEAD --name-only | grep force-app | sort | uniq`).toString().split('\n');
				}else{
					files = exec(`git show $(git describe --tags --abbrev=0)..HEAD --name-only | grep force-app | sort | uniq`).toString().split('\n');
				}
			}else{
				files = exec(`git diff-tree --no-commit-id --name-only -r ${commitid} | grep force-app | sort | uniq`).toString().split('\n'); //this only work with specific commit ids, how to get file that changed since last tag ? 
			}
			for(var i in files){
				var f = files[i];
				if (!f || f == '' || f.indexOf('force-app') < 0) continue;
				
				var basedir = 'force-app/main/default'; //store base folder (force-app) into dbx cli config json file so we can easily change it 
				if (f.indexOf('force-app/test') >= 0){
					basedir = 'force-app/test';
				}
				if (fs.existsSync(f) && !fs.existsSync(path.join(targetdir,f))){ 

					var file = path.parse(f);
					fs.ensureDirSync(path.join(targetdir,file.dir)); //create folder to accept file (including ${targetdir} or acc???)
					
					if (fs.existsSync(f)) fs.copyFileSync(f,path.join(targetdir,f)); //copy original file
					var fileext = file.base.substring(file.base.indexOf('.') + 1);
					var foldername = file.dir.replace(basedir+'/','');
					if (foldername.indexOf('/') >= 0){
						foldername = foldername.split('/')[0];
					}					
					if (foldername === 'staticresources'){
						fs.readdirSync( file.dir ).forEach( function ( fname ) {
							if (fname.indexOf(file.name+'.') >= 0){
								var fileTocopy = path.join(file.dir,fname);
								if (fs.existsSync(fileTocopy)) copyFileSync(fileTocopy,path.join(targetdir,fileTocopy));		
							}
						});
					}else if (extensions[foldername] !== undefined && extensions[foldername][fileext] !== undefined){
						var copyExt = extensions[foldername][fileext]; //base on the file extension, find its extension dependnedies, i.e.: if .cl change, it should include .cls-meta.xml
						if (copyExt){	//if an dependant extension exist, then do the  below otherwise end of process, nothing need to be done
							if (copyExt === '..'){	//2 dots (..) means we are looking at copying the parent folder, i.e.: object 
								var parentfolder = path.normalize(path.join(file.dir,'..')); //copy whole folder
								copyFolderRecursiveSync(file.dir,path.join(targetdir,parentfolder));
							}else if (copyExt.indexOf('..') >= 0){ //what if copy file = ../../../object-meta.xml?
								var parentfolder = path.normalize(path.join(file.dir,'..'));
								copyFolderRecursiveSync(parentfolder,path.join(targetdir,parentfolder,'..'));
							}else{
								var fileTocopy = path.join(file.dir,file.name+'.'+copyExt); //copy direct meta file
								console.log(fileTocopy);
								if (fs.existsSync(fileTocopy)) copyFileSync(fileTocopy,path.join(targetdir,fileTocopy));
							}
						}
					}
				}
			}*/
		}
	};
}());
