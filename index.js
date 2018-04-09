const createorg = require('./commands/env/create_nab_org.js');
const deploy = require('./commands/env/deploy.js');
const createApexClass = require('./commands/code/create_class.js');
const createTrigger = require('./commands/code/create_trigger.js'); 
const bulkInsert = require('./commands/data/bulk_insert.js'); 

(function () {
  'use strict';

  exports.topics = [{
    name: 'env',
    description: 'create nab env'
  },{
    name: 'code',
    description: 'apex utilities'
  },{
    name: 'data',
    description: 'data utilities'
  }];

  exports.namespace = {
    name: 'nab',
    description: 'Various commands from Nab'
  };

  exports.commands = [
    createorg,
    createApexClass,
    deploy,
    createTrigger,
    bulkInsert
  ];

}());