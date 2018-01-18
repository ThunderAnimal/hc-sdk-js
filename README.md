[![Build Status](https://travis-ci.org/gesundheitscloud/hc-sdk-js.svg?branch=master)](https://travis-ci.org/gesundheitscloud/hc-sdk-js)
[![codecov](https://codecov.io/gh/gesundheitscloud/hc-sdk-js/branch/master/graph/badge.svg?token=FcHHp38bcr)](https://codecov.io/gh/gesundheitscloud/hc-sdk-js)

# GesundheitsCloud Web SDK
This is the Javascript Web SDK of GesundheitsCloud, which encapsulates the backend functionality of the platform and enables end-to-end encryption of patient data. It allows users to store sensitive health data on the secure GesundheitsCloud platform and share it to authorized people and applications.

For more information about the platform please visit our [website](http://www.gesundheitscloud.de/).

## Requirements

To use the SDK, you need to create a client id from GesundheitsCloud. Please get in touch with us at info@gesundheitscloud.de.

## Development and build

### Prerequisites
- node, npm/yarn

In the directory run:
```bash
npm install
```

This SDK uses webpack for its bundling task.
Building the SDK bundle is done with :

That will by default build with staging configurations
```bash
 npm run build
```

To build explicit with staging configurations: run
```bash
npm run build:staging
```

To build explicit with sandbox configurations: run
```bash
npm run build:sandbox
```

During development, you can let webpack watch for file changes and rebuild your bundle using:
 ```bash
 npm run watch
```

Import the built file in your project to start using the SDK.

Note: Edit the config.js file accordingly in case of any change in dependent api url and build the sdk. Currently the config for staging url looks like:
```javascript
        api: 'https://staging.hpihc.de'
```

## Tests

The SDK uses karma, mocha, sinon, and chai for unit tests.

For running all tests, execute:
```bash
npm test
```
It uses eslint to check and report incorrect indentations and patterns in the project, bundles the project, run unit tests and makes a coverage report.

For running the unit tests only, execute:
```bash
npm run karma:prod
```
During development, use can watch for any file changes and rerun the tests on any change using:
```bash
npm run karma
```

For running only eslint execute:
```bash
npm run lint
```

## Local server
To start a local test server, execute:

```
$ cd example
$ npm run start
```
This will start a sample app pointing to the staging environment with a predetermined client id for demo purposes.
On successful startup, open the browser pointing to http://localhost:8080/.
