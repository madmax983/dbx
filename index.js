const createorg = require('./commands/env/create_nab_org.js');
const deploy = require('./commands/env/deploy.js');
const createApexClass = require('./commands/create_class.js'); 

(function () {
  'use strict';

  exports.topics = [{
    name: 'env',
    description: 'create nab env'
  },{
    name: 'apex',
    description: 'apex utilities'
  }];

  exports.namespace = {
    name: 'nab',
    description: 'Various commands from Nab'
  };

  exports.commands = [
    createorg,
    createApexClass,
    deploy
  ];

}());