# NAB-CLI

A plugin for the Salesforce CLI built by David Browaeys containing a lot of helpful commands. 

## Setup

### Install from source

1. Install the [SDFX CLI](https://developer.salesforce.com/tools/sfdxcli) if you haven't already.

2. Clone the repository: `git clone git@github.com:FuseInfoTech/FitCLI.git`
    1. If you get an error like `The authenticity of host 'github.com (192.30.255.112)' can't be established.
RSA key fingerprint is SHA256:nThbg6kXUpJWGl7E1IGOCspRomTxdCARLviKw6E5SY8.` try the following instead:
      `git clone https://github.com/FuseInfoTech/FitCLI`

3. Install npm modules: `npm install` 

4. Link the plugin: `sfdx plugins:link` (from within the NAB-CLI directory).
    1. If you get a `A required privilege is not held by the client.` try elevating to an Admin command prompt.
    1. On Windows at least this is creating a shortcut in `%LocalAppData%\heroku\plugins\node_modules`

## Get the latest debug log

This is based off the same command from the [sfdx-waw-plugins by Wade Wegner](https://github.com/wadewegner/sfdx-waw-plugin). The difference here is that it then runs through the debug log parser.

`sfdx fit:apex:log:latest -u <targetusername>`

## Get a summary of the latest debug log

`sfdx fit:apex:log:latest -u <targetusername> --summary`

## Filter the latest debug log to just the USER_DEBUG entries

`sfdx fit:apex:log:latest -u <targetusername> --debugOnly`

## Filter the latest debug log to only the events of interest

`sfdx fit:apex:log:latest -u <targetusername> --filter USER_INFO,CODE_UNIT_STARTED`

## Convert the latest debug log to JSON

`sfdx fit:apex:log:latest -u <targetusername> --json`

## Deployment

`sfdx fit:deployment:fish`
