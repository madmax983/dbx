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
  },{
    name: 'label',
    description: 'label utlities'
  }];

  exports.namespace = {
    name: 'dbx',
    description: 'Various utlity commands for SFDX'
  };

  exports.commands = [
    require('./commands/env/create.js'),
    require('./commands/env/deploy.js'),
    require('./commands/env/backup.js'),
    require('./commands/code/create_class.js'),
    require('./commands/code/create_trigger.js'),
    require('./commands/data/bulk_insert.js'),
    require('./commands/static/create.js'),
    require('./commands/label/create.js')
  ];
}());