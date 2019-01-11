/**
 * TODO: This could be enhanced to allow users to add many components to be destroyed, in the first edition 
 * of this command this will allow a single piece of metadata to be destroyed. 
 */
const forceUtils = require('../../lib/forceUtils.js');
const exec = require('child_process').execSync;
const path = require('path');
const fs = require('fs');
//var format = require('xml-formatter'); 
const stdin = require('readline-sync');
var xml2js = require('xml2js');
const rootDir = './tempFolder'; 
var tempPath = './tempFolder'; 

/**
 * Builds the destructive changes folder, based on the specified component 
 * file name and the folder that will be used to create. 
 * @param {* Name of the folder to create } fullFilePath
 * @param {* The file name of the component } fileName
 * @param {* The api type of the file} type
 */
function addFileToDestructiveChangePackage(fullFilePath, fileName, type) {

        var oldFilePath = './' + fullFilePath; 
        var newFilePath = tempPath + '/' + fileName;
        //the filename in most cases should be the same  
        var file = fileName; 
        fs.copyFileSync(oldFilePath, newFilePath);

        //if the file is a meta file need to properly construct the meta name 
        if(fileName.indexOf('-meta.xml') > -1) {
                fileName = fileName.substring(0, fileName.indexOf('-')); 
                newFilePath = tempPath + '/' + fileName; 
                var originalFilePath = oldFilePath.substring(0, oldFilePath.indexOf('-meta.xml')); 
                if(fs.statSync(originalFilePath).isFile()) {
                        //try to copy the real file as well.. 
                        fs.copyFileSync(originalFilePath, newFilePath); 
                }

                file = fileName.substring(0, fileName.indexOf('.')); 
        }
        else {
                //TODO: add handling to get the metafile 
                var pathToMetaFile = oldFilePath + '-meta.xml'; 
                //try and get the metafile..in the alternate scenario 
                if(fs.statSync(pathToMetaFile).isFile()) {

                }
        }

        //create the package.xml
        //TODO: make the version detect the version in the local source? 
        var packageXml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<Package xmlns="http://soap.sforce.com/2006/04/metadata">\n'
        //TODO read api version from project file 
        +'<version>43.0</version>\n'
        + '</Package>'; 
        fs.appendFileSync(rootDir + '/' + 'package.xml', packageXml);
 
        console.log('The file name: ' + fileName); 
        //now create the destructive change file 
        var destructiveChangeXml = '<?xml version="1.0" encoding="UTF-8"?>\n'
        + '<Package xmlns="http://soap.sforce.com/2006/04/metadata">\n' 
        + '<version>43.0</version>\n'
        + '<types>\n' 
        + '<members>' + file + '</members>\n'
        + '<name>' + type + '</name>\n' 
        + '</types>\n'
        + '</Package>'; 
        fs.appendFileSync(rootDir + '/' + 'destructiveChanges.xml', destructiveChangeXml);

        console.log('The destructive change has been constructed.'); 
}

/**
 * If its the meta file take the current file and read it. We need to determine 
 * this file type can be used as the type in destructive change files or package.xmls 
 * @param {*Full path to the file} fullFilePath 
 * @param {*The name of the file} fileName 
 */
function extractTypeFromMetaFile(fullFilePath, fileName) {
        //find the meta file for the file 
        //if the file has the meta info in it 
        var data = null; 
        if(fileName.indexOf('-meta.xml') < 0) {
               //user has passed in something which is not a metadata file (e.g. apex class)
                fullFilePath = fullFilePath + '-meta.xml'; 
        }

        data = fs.readFileSync(fullFilePath, 'utf-8');   

        var type = ''; 
        var parser = new xml2js.Parser( {"explicitArray":false});
        parser.parseString(data,function (err, result) {
                
        }); 
        var data = JSON.stringify(data); 
        //get the first line after the xml declaration 
        var firstLine = data.split('\\n')[1]; 
        //use regex to split out spaces 
        var typeWithBracket = firstLine.split(/\s+/); 
        //then remove the bracket from the start to leave the metadata type
        var finalType = typeWithBracket[0].substring(1, typeWithBracket[0].length); 
        console.log('The metadata type to remove : ' + finalType); 

        return finalType; 
}



/**
 * Function that will create a destructive changes folder. If the folder already exists prompt user whether they want to 
 * redeploy 
 * delete its contents and recreate 
 */
function createDestructiveChangeFolder() { 
        try {
                var yn = stdin.question(`WARNING: This command will destroy the component  in the specified org Y/N: `);
                if(yn === 'y') {
                        if(!fs.existsSync(tempPath)) {
                                fs.mkdirSync(tempPath); 
                                console.log(`Folder has been created..`); 
                                
                        }
                        else {
                                console.log(`No folder exists..`); 
                        }
                        return true;
                }
        }
        catch(err) {
                console.log(`Failed to create the destructive changes folder: ` + err); 
        }

        return false;
}

/*
* Build the folder structure for the temporary folder 
*/ 
function buildTempFolders(path, rootSource) {
        var foldersFiles = path.split('/') ; 
        foldersFiles.forEach(function(folderFile) {
                //check if the folder already exists in the root source, we can ignore those 
                if(rootSource.indexOf(folderFile) == -1) {
                        //check its a file (should be last element in the array) 
                        if(folderFile != foldersFiles[foldersFiles.length - 1]) {
                                //check if directory exists and if not create it
                                if(!fs.existsSync(tempPath + '/' + folderFile)) {
                                        fs.mkdirSync(tempPath + '/' + folderFile); 
                                }

                                tempPath = tempPath + '/' + folderFile; 
                        } 
                }
        });
}

function deployDestructiveChangePackage(orgname) {
        console.log(`Deploying the destructive change package.`); 
        let stdout = JSON.parse(exec(`sfdx force:mdapi:deploy --deploydir ` + rootDir + ` -u ${orgname} --json`).toString());
        
        let jobId = stdout.result.id;
        console.log('Job['+jobId+'] has been added to the Queue...');

        while(true){
                stdout = JSON.parse(exec(`sfdx force:mdapi:deploy:report -i ${jobId} -u ${orgname} --json`).toString());
                if (stdout.result.done){
                        console.log('\x1b[91m%s\x1b[0m', `Thank you for your patience! The component has been destroyed!`);
                        break;
                }
        }
}

  /**
 * Funtion that will deploy a destructive change into the current environment 
 * @param {Path to destructive change} xmlPath 
 */
function buildDestructiveChangePackage(metadataName, source) {
        //reads all the files recursively under the source directory 
        var fileStruc = readFiles(source, []);  
        fileStruc.forEach(function(fullFilePath) { 
        
                var fileName = fullFilePath.substring(fullFilePath.lastIndexOf("/") + 1, fullFilePath.length); 
                if(fileName == metadataName) {
                        //found the specifed file 
                        console.log('Metadata component found! : ' + fullFilePath);
                        buildTempFolders(fullFilePath, source); 
                        var type = extractTypeFromMetaFile(fullFilePath, fileName); 
                        addFileToDestructiveChangePackage(fullFilePath, fileName, type); 
                       
                }
        })
        
        return true; 
}

//lists all files in a directory recursively in a synchronous fashion
function readFiles (dir, filelist) {
        fs.readdirSync(dir).forEach(file => {
                //console.log('File : ' + file); 
               if(fs.statSync(path.join(dir, file)).isDirectory()) {
                       filelist = readFiles(path.join(dir, file), filelist); 
               }
               else {
                       filelist = filelist.concat(path.join(dir, file));
               } 
        });
        return filelist;
}

(function () {
    'use strict';
  
      module.exports = {
          topic: 'env',
          command: 'destroy',
          description: 'Deploy a destructive change to the environment.',
          help: 'Takes a path to a destructive changes xml file & applies this to the org.',
          flags: [{
                  name: 'orgname',
                  char: 'u',
                  description: 'name of scratch org',
                  hasValue: true, 
                  required: true
          }, 
          {
                  name: 'component',
                  char: 'c',
                  description: 'component name to remove',
                  hasValue: true,
                  required: true
          }],
          run(context) {
               
                let orgname = context.flags.orgname;
                let component = context.flags.component; 
                 
                var execCont = createDestructiveChangeFolder(); 
                if(execCont) {
                        //TODO: read the source from a configuration file 
                        //this would allow users to change where their destructivechange package is stored 
                        buildDestructiveChangePackage(component, './force-app/main/default/'); 
                        var yn = stdin.question(`Destructive change package was created successfully. Apply this change to ${orgname}? Y/N: `);
                        if(yn == 'y') { 
                                deployDestructiveChangePackage(orgname); 
                        }
                }
          }
  };
  }());

