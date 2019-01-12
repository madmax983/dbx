# DBX-CLI

A plugin for the Salesforce CLI built by David Browaeys containing a lot of helpful commands.

## Pre-requisite
1. Install [SDFX CLI](https://developer.salesforce.com/tools/sfdxcli) 

2. Install [node.js. + npm](https://nodejs.org/en/). 
Once installed, checkout proxy setting if you are behind corporate proxy.


## Proxy Settings

1. Config npm proxy one by one in a new terminal

    ```shell
    npm config set https-proxy http://address:port
    npm config set proxy http://address:port
    npm config set sslVerify false
    npm config set strict-ssl false
    ```

## Install DBX-CLI

1. go to your workspace and clone the repository:

    ```shell
    git clone https://github.com/davidbrowaeys/dbx.git
    ``` 

2. Go to dbx repo and install npm modules: 

    ```shell
    npm install
    ```

3. Link dbx-cli plugin to SFDX, go to dbx-cli folder and execute

    ```shell
    sfdx plugins:link .
    ```
4. In your sfdx project, you must create <a href="https://github.com/davidbrowaeys/dbx/blob/master/dbx-cli.json">dbx-cli.json</a> and put in under config folder along with your project-scratch-def.json.

## Usage

### ENV commands

#### Create dbx scratch org with code and data

```shell
Usage: sfdx dbx:env:create

Create dbx standard scratch org

Flags:
-s, --defaultorg                 mark as default org
-d, --durationdays DURATIONDAYS  duration of the scratch org (in days) (default:30, min:1, max:30)
-f, --includedata                indicate if dbx data need to be imported
-p, --includepackages            include packages from cli config file
-u, --orgname ORGNAME            name of scratch org

help text for dbx:env:create
```


#### Deploy source code

```shell
Usage: sfdx dbx:env:deploy
 
Convert DX files to metadata and deploy to target env
 
Flags:
-u, --orgname ORGNAME  (required) name of scratch org
--json                 return json format
 
help text for dbx:env:deploy
```

#### Full or delta data backup

```shell
Usage: sfdx dbx:env:backup
 
Perform data backup of target environment
 
Flags:
-m, --delta DELTA                Backup data since last runtime
-u, --orgname ORGNAME            name of scratch org
-d, --outputdir OUTPUTDIR        output directory path to store files
-r, --resultformat RESULTFORMAT  format of the output files: csv(default), xml, or json

help text for dbx:env:backup
```

### Code Commands

#### Create class

```shell
Usage: sfdx dbx:code:class
 
Apex class creation
 
Flags:
-n, --apiname APINAME        (required) api name of the class
-v, --apiversion APIVERSION  Api version of metadata, default 42.0
-u, --orgname ORGNAME        name of scratch org
-t, --template TEMPLATE      apex class template, choose one of the following available tempplates:
                              Constructor(default)
                              NoConstructor
                              Batch
                              Schedulable
                              ServiceClass
                              Exception
                              TestClass
--push                       push class automatically to scratch org after creation
 
help text for apex:class:handler:create
``` 

#### Create trigger

```shell
Usage: sfdx dbx:code:trigger
 
Create trigger handler class using SObjectDomain framework
 
Flags:
-o, --sobject SOBJECT  (required) SObject
 
help text for dbx:code:trigger
```

### Configuration

#### Create static resource

```shell
Usage: sfdx dbx:config:create

Create static resource

Flags:
-c, --cachecontrol CACHECONTROL  public or private static resource
-d, --description DESCRIPTION    (required) description
-f, --file FILE                  (required) path of the file to create
-n, --name NAME                  (required) static resource name
--push                           push to scratch org

help text for dbx:static:create
```

#### Create custom label

```shell
Usage: sfdx dbx:config:label 

Create custom label

Flags:
 -c, --categories CATEGORIES  categories
 -n, --name NAME              (required) name of custom label
 -u, --orgname ORGNAME        name of scratch org
 -v, --value VALUE            (required) value
 --push                       push to scratch org

help text for dbx:label:create
```
