[![Build Status](https://travis-ci.com/gesundheitscloud/hc-sdk-js.svg?token=6V7y4qkm7an1Wx4Zdpf2&branch=develop)](https://travis-ci.com/gesundheitscloud/hc-sdk-js)
[![codecov](https://codecov.io/gh/gesundheitscloud/hc-sdk-js/branch/develop/graph/badge.svg?token=FcHHp38bcr)](https://codecov.io/gh/gesundheitscloud/hc-sdk-js)

# GesundheitsCloud Web SDK
This is the Javascript Web SDK of GesundheitsCloud, which encapsulates the backend functionality of the platform and enables end-to-end encryption of patient data. It allows users to store sensitive health data on the secure GesundheitsCloud platform and share it to authorized people and applications.

For more information about the platform please visit our [website](https://www.gesundheitscloud.de/).

## Requirements

To use the SDK, you need to create a client id from GesundheitsCloud. Please get in touch with us at info@gesundheitscloud.de.

## Development and build

### Prerequisites
- node, npm/yarn

In the directory run:
 ```
 npm install
 ``` 
 
This SDK uses webpack for its bundling task.
Building the SDK bundle is done with :
 
 ```bash
 npm run build
```
During development, you can let webpack watch for file changes and rebuild your bundle using:
 ```bash
 npm run watch
```

Import the built file in your project to start using the SDK.

Note: Edit the config.js file accordingly in case of any change in dependent api urls(eg. capella, sirius, arcturus) and build the sdk. Cuurently the config for staging urls looks like:
```javascript
        {
            auth: 'https://staging.hpi.de',
            document: 'https://staging.hpi.de',
            user: 'https://staging.hpi.de',
        }
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
