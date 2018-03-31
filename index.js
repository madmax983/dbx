const createNabOrg = require('./commands/create_nab_org.js');
const createApexClass = require('./commands/create_class.js');
const deploy = require('./commands/deploy.js');

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
    createNabOrg,
    createApexClass,
    deploy
  ];

}());