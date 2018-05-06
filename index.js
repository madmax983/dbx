const createorg = require('./commands/env/create.js');
const deploy = require('./commands/env/deploy.js');
const backup = require('./commands/env/backup.js');
const createApexClass = require('./commands/code/create_class.js');
const createTrigger = require('./commands/code/create_trigger.js');
const bulkInsert = require('./commands/data/bulk_insert.js');
const staticresource = require('./commands/static/create.js');

(function () {

  'use strict';
  exports.topics = [{
    name: 'env',
    description: 'env utilites'
  },{
    name: 'code',
    description: 'apex utilities'

  },{
    name: 'data',
    description: 'data utilities'
  },{
    name: 'static',
    description: 'static resource utilities'
  }];

  exports.namespace = {
    name: 'dbx',
    description: 'Various commands from Nab'
  };

  exports.commands = [
    createorg,
    createApexClass,
    deploy,
    createTrigger,
    bulkInsert,
    backup,
    staticresource
  ];
}());