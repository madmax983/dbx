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


(function () {
  'use strict';

	module.exports = {
		topic: 'delta',
		command: 'meta:depend:copy2',
		description: 'command to copy metadata dependencies for delta deployment',
		help: 'help text for dbx:delta:meta:depend:copy2',
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
				name: 'businesscontext',
				char: 'b',
				description: 'business context',
				hasValue: true,
				required: false
			}],
		run(context) {
			let config = JSON.parse(fs.readFileSync('./config/dbx-cli-def.json').toString());

			var commitid = context.flags.commitid;
			var mode = context.flags.mode;
			var targetdir = context.flags.targetdir;
			var businesscontext = context.flags.businesscontext;

			if (!fs.existsSync(targetdir)){ 
				fs.mkdirSync(targetdir);
			}
			fs.copyFileSync('sfdx-project.json',path.join(targetdir,'sfdx-project.json')); 

			//git diff-tree --no-commit-id --name-only -r 2d9dc0fd1f5148b9f4dac23215c4aaaae64c1ab1
			var files;
			if (mode === 'tags')
				files = exec(`git show $(git describe --tags --abbrev=0)..HEAD --name-only | grep dbx-app | sort | uniq`).toString().split('\n');
			else
				files = exec(`git diff-tree --no-commit-id --name-only -r ${commitid} | grep dbx-app | sort | uniq`).toString().split('\n'); //this only work with specific commit ids, how to get file that changed since last tag ? 
			console.log(files);
			if (!businesscontext){
				for(var i in files){
					var f = files[i];
					if (f.indexOf('dbx-app/service') >= 0){
						businesscontext = 'service';break;
					}else if (f.indexOf('dbx-app/sale') >= 0){
						businesscontext = 'sale';break;
					}else if (f.indexOf('dbx-app/etm') >= 0){
						businesscontext = 'etm';break
					}
				}
			}

			if (!businesscontext){
				console.error('System could not define a business context(service, sale, etm). Please run this manually!');
    			return;
            }
            
            var forceignorecontent = fs.readFileSync(path.join('forceignore',businesscontext)).toString();
	        fs.writeFileSync(path.join(targetdir,'.forceignore'), forceignorecontent);

			var basedir = config.appDirectories[businesscontext].basedir;
            
			for(var i in files){
                var f = files[i];

                if (!f || f == '' || f.indexOf('dbx-app') < 0) continue;
                
				if (config.appDirectories[businesscontext].testdir && f.indexOf('dbx-app/sale/test') >= 0){
					basedir = config.appDirectories[businesscontext].testdir;
                }
				if (fs.existsSync(f) && !fs.existsSync(path.join(targetdir,f))){ 

					var file = path.parse(f);
					fs.ensureDirSync(path.join(targetdir,file.dir)); //create folder to accept file (including ${targetdir} or acc???)
					
					if (fs.existsSync(f)) fs.copyFileSync(f,path.join(targetdir,f)); //copy original file
                    var fileext = file.base.substring(file.base.indexOf('.') + 1);
                    var foldername = file.dir.replace( (f.indexOf() >= 0 ? 'dbx-app/core': basedir) + '/' ,'');
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
								if (fs.existsSync(fileTocopy)) copyFileSync(fileTocopy,path.join(targetdir,fileTocopy));
							}
						}
					}
				}
			}
		}
	};
}());

