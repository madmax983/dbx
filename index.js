(function () {
  'use strict';

  exports.topics = 
  [{
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
    description: 'utilities to manipulate profile files\n\nUsage:\n1. pull from origin/develop\ngit pull origin develop\n2. push to scratch org new changes\nsfdx force:source:push -u myorg\n3. convert profiles xml files to json\nsfdx dbx:profile:convert\n4. make change in scratch org\nsfdx force:source:pull -u myorg\n5. re-convert profiles xml files to json\nsfdx dbx:profile:convert\n6. rebuild profile meta xml files from json files\nsfdx dbx:profile:build'
  },{
    name: 'flow',
    description: 'utilities to manipulate flows & flow definitions'
  },{
    name: 'test',
    description: 'prototypes'
  },{
    name: 'delta',
    description: 'utilities to manipulate metadata for delta deployment'
  }];

  exports.namespace = {
    name: 'dbx',
    description: 'Various utility commands for dbx developers'
  };

  exports.commands = [
    require('./commands/env/create.js'),
    require('./commands/env/refresh.js'),
    require('./commands/env/deploy.js'),
    require('./commands/env/destroy.js'),
    require('./commands/env/backup.js'),
    require('./commands/code/create_class.js'),
    require('./commands/code/create_trigger.js'),
    require('./commands/data/bulk_insert.js'),
    require('./commands/data/transfer.js'),
    require('./commands/data/query_explain.js'),
    require('./commands/static/create.js'),
    require('./commands/label/create.js'),
    require('./commands/object/create.js'),
    require('./commands/validationrule/create.js'),
    require('./commands/profile/convert.js'),
    require('./commands/flow/re-version.js'),
    require('./commands/profile/build.js'),
    require('./commands/api/setapiversion.js'),
    require('./commands/fieldset/create.js'),
    require('./commands/prototype/spinner.js'),
    require('./commands/env/reset_workflow.js'),
    require('./commands/env/copy_meta_dependencies.js'),
    require('./commands/env/copymetadependecies.js'),
    require('./commands/env/setbusinesscontext.js')
  ];
}());
