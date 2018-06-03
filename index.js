(function () {

  'use strict';
  exports.topics = [{
    name: 'env',
    description: 'various commands to facilitate the creation of a scratch org, ...'
  },{
    name: 'code',
    description: 'various commands to create apex class, apex triggers, ...'
  },{
    name: 'data',
    description: 'some cool stuffs around data manipulations'
  },{
    name: 'config',
    description: 'multiple config utilities such as static resource, label, ...'
  },{
    name: 'profile',
    description: 'profile converter'
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
    require('./commands/label/create.js'),
    require('./commands/profile/convert.js'),
    require('./commands/profile/build.js')
  ];
}());