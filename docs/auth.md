# GesundheitsCloud Web SDK's Auth Wrapper
GesundheitsCloud uses the OAuth [Authorization Code Grant](https://tools.ietf.org/html/rfc6749#section-4.1) flow for web clients. Part of this flow is a __client__ that has a __client secret and communicates safely with the __Authorization Server__.
To reduce the implementation time of the GesundheitsCloud SDK, we provide an __OAuth Client__ that handles  the access token life cycle and stores additional information dependent upon the session of the user agent.
The Auth Wrapper for the Gesundheitscloud Web SDK is developed in a way, that it enables the communication with this __OAuth Client__. Therefor the setup details for the GesundheitsCloud Web SDK differ slightly.
This documentation should be read in addition to the [GesundheitsCloud Web SDK README](sdk.md). Missing details can be found there.

## Requirements
To use the Auth Wrapper with the GesundheitsCloud Web SDK you need to get a client ID and client secret. Please get in touch with at info@gesundheitscloud.de in case you would like to implement our SDK.

## Usage
Instead of calling the GesundheitsCloud Web SDK's setup method, it is necessary to call the Auth Wrapper's setup method. It automatically sets up the GesundheitsCloud Web SDK with a private key and an access token. It also maintains their lifetime during the session with the user agent.

## Using the Auth Wrapper

1. Get our docker container that maintains the user agent's access token and private key lifecycle during a session. If it is not yet open sourced, please reach out to info@gesundheitscloud.de.

2. Configure the docker container properly in your backend.

3. Import the javascript file from the provided URL (see example below).
```html
 <script src="${url}/healthcloud_sdk.js"></script>
```

It inserts a GC object into the global namespace. It contains the GesundheitsCloud Web SDK and the Auth Wrapper.
```JavaScript
GC = { SDK, AUTH };
```

3. Initialize the SDK by calling the Auth Wrapper with your client ID and the URL to the __OAuth Client__ from step 1 and 2.

Example:
```JavaScript
// assuming that your domain is your-domain.com and the path /oauth redirects to the __OAuth Client__
const clientURL = 'your-domain.com/oauth';
const clientId = '123';

GC.AUTH.config({
    clientId: `${ clientId }`,
    clientURL: `${ clientURL }`,
});
```

The config returns a promise that contains the result of the GesundheitsCloud Web SDK.

4. Login

    a) If the user has a valid session with the OAuth Client from step 1 and 2, it will receive its acess token and private key. The user is logged in.

    b) If the user has no valid session with the OAuth Client from step 1 and 2. The user will need to be redirected with the login method of the Auth Wrapper. Beware that it triggers a redirect of the user agent.
    If the login was successful, the OAuth Client will redirect the user agent to the URL you configured. It now has a valid session and is logged in as defined in step 4.a).

    ```JavaScript
    GC.AUTH.login();
    ```

It is possible to check if the user is Logged in by calling. Example:
```JavaScript
GC.AUTH.loggedIn.then((isLoggedIn) => {
    if (isLoggedIn) {
        doSomething();
        return;
    }

    GC.AUTH.login();
});
```

For the usage of the GesundheitsCloud Web SDK please take a look into the [README](sdk.md).
