# NAB-CLI

A plugin for the Salesforce CLI built by David Browaeys containing a lot of helpful commands. 

## Setup

### Install from source

1. Install the [SDFX CLI](https://developer.salesforce.com/tools/sfdxcli) if you haven't already.

2. Clone the repository: https://github.com/davidbrowaeys/nab-cli

3. Install npm modules: `npm install` 

4. Link the plugin: `sfdx plugins:link` (from within the NAB-CLI directory).
    1. If you get a `A required privilege is not held by the client.` try elevating to an Admin command prompt.
    1. On Windows at least this is creating a shortcut in `%LocalAppData%\heroku\plugins\node_modules`

## Create nab scratch org with code and data 

`sfdx nab:env:deploy -u <ORGNAME>`

## Deploy source code 

`sfdx nab:env:deploy -u <ORGNAME>`
