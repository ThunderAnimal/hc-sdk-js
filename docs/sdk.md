# GesundheitsCloud Web SDK
This is the Javascript web SDK of GesundheitsCloud, which encapsulates the backend functionality of the platform and enables end-to-end encryption of patient data. It allows users to store sensitive health data on the secure GesundheitsCloud platform and share it to authorized people and applications.

For more information about the platform please see our [website](https://www.gesundheitscloud.de/).

## Requirements
To use the SDK, you need to create a client id from GesundheitsCloud. Please get in touch with us at info@gesundheitscloud.de.

## Usage
The SDK allows you to register a user with GesundheitsCloud, log in the user, upload and download your sensitive documents with end-to-end encryption. It internally does all the work needed to prove the identity to the server without leaking the password.

The SDK compiles into a bundle, which can then be imported into the project.

## Bundling
Refer to README.md for bundling the SDK.

## Setup

1.  Import the javascript file from the provided URL (see example below). You may need to modify the version number later.
It inserts a healthcloud_sdk object into the global namespace.
```   html
 <script src="${url}/healthcloud_sdk.js"></script>
```

2. Initialise the SDK, providing your client id:
```javascript
    var HC = new healthcloud_sdk({
        "clientId":"my_client_id"
    });
```

3. Use the functions exposed by the SDK. Currently the functions exposed are:
    - getRegistrationForm
    - getLoginForm
    - getUser
    - uploadDocument
    - downloadDocument

#### Register
To register a user, append the registration form to a node.
Therefore you need to call  ``HC.getRegistrationForm(parent_node, callback)``.
Hence the form is then appended to ``parent_node``.
The ``callback`` function is then called with the standard error and success parameters, whenever the user is pressing the "register" button.

```html
<div id="gesundheitsregister"></div>
```
```javascript
HC.getRegistrationForm(document.getElementById("gesundheitsregister"), function(error, success){
    if(error){
        
    }
});
```

In the case of a successful registration, ``error`` is null, and ``success`` contains the user id as below.
```json
    {
        "user_id": "user_id"
    }
```

The user will need to login after registration.

#### Login
The login step is similar to registering. 
Call ``HC.getLoginForm(parent_node, callback)`` to get the login form appended to ``parent_node``.
Whenever the user tries to log in to GesundheitsCloud ``callback`` is called to perform corresponding actions.
As for registration the parameters of the callback function error and success.

```javascript
HC.getLoginForm(document.getElementById("gesundheitslogin"), function(error, success) {})
```

The SDK automatically performs the required authentication steps during the login. 

#### Get the Current User
You can get the currently active user synchronously by calling getUser. 

```javascript
 HC.getUser();
```
In case of a logged in user getUser returns an user object.
```json
{   
    "user_name": "user_name",
    "user_id": "user_id"
}
```

#### Upload Document
Uploading a document requires a logged in user.
The SDK encrypts the data before uploading it to the GesundheitsCloud.
Only the owner of the documents and those who have explicit permission from the owner are able to download the documents.

To upload the document:
```javascript
 HC.uploadDocument('user_name', file)
    .then((response) => {
        // use document metadata which contains document id,status etc.
    })
    .catch((error) => {
        // error contains the status and error message
    });
```

On Success, the response consists the documents metadata:
```json
{
     "document_id": "documentId"     
} 
```

#### Download Document
To download the document multiple requirements need to be fulfilled:
  - A user is logged in.
  - The logged in user has the right to access the document.
    - The user is the owner of the document
    - The user has the owners permission to access the document. 

To download the document call downloadDocument providing the owners username and the document id
```javascript
  HC.downloadDocument('user_name','document_id').then((response) => {
    // the response is the decrypted document
  })
  .catch((error) => {
    // error contains the status 
  })
```

The response consists of decrypted document. eg. for an image file:
```text
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAeoAAAMECAYAAABwvGbhAAAMFGlDQ1BJQ0MgUHJvZmlsZQAASIm
VVwdUk8kWnr+kEBJaIAJSQm+C9CoQCFUQkA42QhIglIAJQcWOLCq4dhHBiq6KKLoWQOzYlUXBgv2BiIqyLhZsqLxJAV1fO++e
M5kvd+698937z8yZAUDVnpOXl42qAZAjzBdFB/szE5OSmaQuQAQMMAo2Ow5XnOcXFRUOoAz3f5f3twEi7W/YSmP96/h/FXUeX
8wFAImCOJUn5uZAfBgAXJubJ8oHgNAC9SYz8vOkuB9iTREkCAARl+J0OdaW4lQ5HiOziY1mQ8wCgEzlcETpAKhIeTMLuOkwjo
qUo72QJxBCvBFiH24GhwfxA4jH5OTkQqxKhtgy9Yc46X+LmToSk8NJH8HyXGRCDhCI87I5s/7PcvxvycmWDM9hDBs1QxQSLc0
Z1m13Vm6YFFMhPi5MjYiEWAPiSwKezF6K72VIQuIU9n1cMRvWDH5lgAIeJyAMYj2IGZKsOD8FduSIZLM7DfdNDeE8kEhlEC6I
b3JdJxEz
```

In case the user does not have the right to access the document an error will be thrown.

In the case of any error in uploading and downloading documents, the format is: 
```json
    {
        "status": 403,
        "error": {} 
    }
```

### Sample Code
#### For uploading the document

```html
<form enctype="multipart/form-data">
    <input id="upload" type="file"   accept="image/png" name="files[]" size=30>
</form>
```

```javascript
    function handleFileSelect(evt) {
        let files = evt.target.files; 
    
        let f = files[0];
    
        let reader = new FileReader();
    
        reader.onload = function (e) {
            HC.uploadDocument('user_id', e.target.result);
        };
    
        reader.readAsDataURL(f);
    }
    
    document.getElementById('upload').addEventListener('change', handleFileSelect, false);
```
