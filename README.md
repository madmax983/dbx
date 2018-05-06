# DBX-CLI

A plugin for the Salesforce CLI built by David Browaeys containing a lot of helpful commands.

 
## Setup

1. Install the [SDFX CLI](https://developer.salesforce.com/tools/sfdxcli) if you haven't already and [NPM](https://nodejs.org/). 

2. go to your workspace and clone the repository:

    ```shell
    git clone https://github.aus.thenational.com/EntCRM/nab-cli
    ``` 

3. Install yarn (as a admin) :
    1. using npm (not always works):
    ```shell
    npm install -g yarn
    ```
    2. from website (easiest): https://yarnpkg.com/en/

4. Config yarm proxy (same way as npm) one by one in a new terminal(no admin required)

    ```shell
    yarn config set https-proxy http://sparpxyapp.aur.national.com.au:8080
    yarn config set proxy http://sparpxyapp.aur.national.com.au:8080
    yarn config set sslVerify false
    yarn config set strict-ssl false
    ```

5. Go to nab-cli repo and install npm modules (as a admin): 

    ```shell
    npm install
    ```

6. Link nab-cli plugin to SFDX (non admin), go to nab-cli folder and execute

    ```shell
    sfdx plugins:link
    ```

## ENV Commands

### Create nab scratch org with code and data

```shell

Usage: sfdx nab:env:create

 

Create nab standard scratch org

 

Flags:

-s, --defaultorg                 mark as default org

-d, --durationdays DURATIONDAYS  duration of the scratch org (in days) (default:30, min:1, max:30)

-f, --includedata                indicate if nab data need to be imported

-p, --includepackages            include packages from cli config file

-u, --orgname ORGNAME            name of scratch org

 

help text for nab:env:create

```


### Deploy source code

```shell

Usage: sfdx nab:env:deploy

 

Convert DX files to metadata and deploy to target env

 

Flags:

-u, --orgname ORGNAME  (required) name of scratch org

--json                 return json format

 

help text for nab:env:deploy

```

### Full or delta data backup

```shell

Usage: sfdx nab:env:backup

 

Perform data backup of target environment

 

Flags:

-m, --delta DELTA                Backup data since last runtime

-u, --orgname ORGNAME            name of scratch org

-d, --outputdir OUTPUTDIR        output directory path to store files

-r, --resultformat RESULTFORMAT  format of the output files: csv(default), xml, or json

 

help text for nab:env:backup

```

## Code Commands

### Create class

```shell

Usage: sfdx nab:code:class

 

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

### Create trigger

```shell

Usage: sfdx nab:code:trigger

 

Create trigger handler class using SObjectDomain framework

 

Flags:

-o, --sobject SOBJECT  (required) SObject

 

help text for nab:code:trigger

```

## Static Resource

### Create

```shell

Usage: sfdx nab:static:create

 

Create static resource

 

Flags:

-c, --cachecontrol CACHECONTROL  public or private static resource

-d, --description DESCRIPTION    (required) description

-f, --file FILE                  (required) path of the file to create

-n, --name NAME                  (required) static resource name

 

help text for nab:static:create

```