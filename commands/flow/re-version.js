var fs = require('fs');
var xml2js = require('xml2js');

/**
 * @param fileName - name of the file to have its version altered s 
 */
function writeFileDefinition(fileName, flowPath) {
    console.log('Starting the file modification...'); 
    //console.log('Writing file definition..'); 
    var data = fs.readFileSync(flowPath + '/' + fileName, 'utf-8'); 
   
    //do the version change in the definition 
    var oldFlowVersion = 1;  
    var parser = new xml2js.Parser( {"explicitArray":false});
    parser.parseString(data,function (err, result) {
       oldFlowVersion = result.FlowDefinition.activeVersionNumber; 
    }); 
    console.log('Old flow version number: ' + oldFlowVersion); 
    
    var flowVersionUpdate = data.replace('activeVersionNumber>' + oldFlowVersion, 'activeVersionNumber>1');  
    fs.writeFileSync(flowPath + '/' + fileName, flowVersionUpdate, 'utf-8'); 
    
    return oldFlowVersion;   
}
(function() {

  'use strict';
  module.exports = {
      topic: 'flow',
      command: 're-version',
      description: 'Changes the version numbers for flows back to version 1.',
      help: '',
      //for an initial implementation don't need any params just change versions in a folder 
      flags: [],

      run(context) {
           var flowDefinitionPath = `./force-app/main/default/flowDefinitions`;
           if (!fs.existsSync(flowDefinitionPath)) {
               throw NodeJS.console.error('Cannot find directory with flow definition xml.');
           }
 
           //loop through the flow definition files
           fs.readdirSync(flowDefinitionPath).forEach(file => {
               //rewrites the defintion version back to v1 & returns what version was active (e.g. version 6)
               var flowVersion = writeFileDefinition(file, flowDefinitionPath);
                //if there is more than one version in the flow definition active flow version continue 
                if(flowVersion != 1) {
                    var flowName = file.replace('.flowDefinition-meta.xml', '');
                    var flowPath = `./force-app/main/default/flows`; 
                    
                    if (!fs.existsSync(flowPath)) {
                            throw NodeJS.console.error('Cannot find directory with flow xml.');
                    }
                    //delete other versions of the flow
                    for(var i = flowVersion -1; i > 0; i--) {
                        fs.unlinkSync(flowPath + '/' + flowName + '-' + i + '.flow-meta.xml'); 
                    }
                    //rename the newest version back to version one
                    fs.rename(flowPath + '/' + flowName + '-' + flowVersion + '.flow-meta.xml', flowPath + '/' + flowName + '-1.flow-meta.xml');
                }
            });
        
            console.log('re-version has completed successfully.'); 
      } 
    }
}());