# NAB-CLI

A plugin for the Salesforce CLI built by David Browaeys containing a lot of helpful commands. 

## Setup

### Install from source

1. Install the [SDFX CLI](https://developer.salesforce.com/tools/sfdxcli) if you haven't already.

2. go to your workspace and cline Clone the repository: 
	`git clone https://github.com/davidbrowaeys/nab-cli`

3. Go to nab-cli repo and install npm modules:  
	`cd nab-cli
	npm install`
4. Link nab-cli plugin to SFDX: 
	`sfdx plugins:link`
    1. If you get a `A required privilege is not held by the client.` try elevating to an Admin command prompt.
    1. On Windows at least this is creating a shortcut in `%LocalAppData%\heroku\plugins\node_modules`

## ENV Commands

### Create nab scratch org with code and data 

`sfdx nab:env:create -u <ORGNAME>`

### Deploy source code 

`sfdx nab:env:deploy -u <ORGNAME>`

## Code Commands

### Create trigger

`sfdx nab:code:trigger -o <SOBJECTNAME>`