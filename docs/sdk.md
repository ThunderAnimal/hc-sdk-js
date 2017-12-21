# GesundheitsCloud Web SDK
This is the Javascript web SDK of GesundheitsCloud, which encapsulates the backend functionality of the platform and enables end-to-end encryption of patient data. It allows users to store sensitive health data on the secure GesundheitsCloud platform and share it to authorized people and applications.

For more information about the platform please see our [website](https://www.gesundheitscloud.de/).

## Requirements
To use the SDK, you need to create a client id from GesundheitsCloud. Please get in touch with us at info@gesundheitscloud.de.

## Usage
The SDK allows you to register a user with GesundheitsCloud, log in the user, upload or download your sensitive documents and share your data with another user, all with end-to-end encryption. It internally does all the work needed to prove the identity to the server without leaking the password.

The SDK compiles into a bundle, which can then be imported into the project.

## Bundling
Refer to README.md for bundling the SDK.

## Using the SDK

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
    - getLoginForm
		- getRegistrationForm
		- downloadDocument
		- uploadDocument
		- updateDocument
		- deleteDocument
		- getDocuments
		- getCurrentUser
		- getUser
		- updateUser
		- grantPermission
		- logout

### Register
To register a user, append the registration form to a node and call ``HC.register``.
This registration form contains name and password field, a submit button needs to be supplied by SDK user.
Therefore you need to call  ``HC.getRegistrationForm(parent_node)``. Hence the form is then appended to ``parent_node`` element.
You will also need a ``<button/>`` tag that has a click event listener. This listener should call ``HC.register`` to perform registration.
Both ``HC.getRegistrationForm`` and ``HC.register`` returns promises.

```html
<div id="gesundheitsregister"></div>
<button id="submitRegister">Register</button>
```
```javascript
HC.getRegistrationForm(document.getElementById("gesundheitsregister"))
.then((response) => {
  // Login form was loaded successfully
})
.catch((error) => {
  // Error loading login form
});

document.getElementById("submitRegister").addEventListener("click", () => {
  HC.register()
  .then((response) => {
    // User successfully registered
  })
  .catch((error) => {
    // Error during registration
  });
});
```

In the case of a successful registration, ``error`` is contains a message, and ``response`` contains the user id as below.
```json
    {
        "alias": "hcUserAlias"
    }
```

The user will need to login after registration.

### Login
The login step is similar to registering.
Call ``HC.getLoginForm(parent_node, callback)`` to get the login form appended to ``parent_node``.
After user tries to login the request result will be processed as a promise.

```javascript
HC.getLoginForm(document.getElementById("gesundheitslogin"))
.then((response) => {
  // User successfully logged in
})
.catch((error) => {
  // Error on login
});
```

The SDK automatically performs the required authentication steps during the login.

### Get the Current UserId and Alias
You can get the currently active user synchronously by calling getUserIdAndAlias.

```javascript
 HC.getCurrentUser();
```
In case of a logged in user getUserIdAndAlias returns a basic user object.
```json
{   
    "alias": "user_alias",
    "id": "user_id"
}
```
### Get the Current User

You can get the detailed user by calling ``getUser`` function, which returns a promise.

To get the user
```javascript
 HC.getUser()
    .then((response) => {
    })
    .catch((error) => {
    });
```
where response is:
```json
          {
				id: '93725dda-13e0-4105-bffb-fdcfd73d1db5',
				alias: 'user_email',
				userData: {
					name: 'user_name',
					...
				}
		  }
```


### Update the Current user
You can edit user data from the currently logged in user.

```javascript
// options is an object that contains any kind of property
 HC.updateUser(options)
 .then((response) => {
   // response will be an empty object
 })
 .catch((error) => {});
```

### Documents

#### Document
All operations on Documents are based on the hcDocument.
For creating a Document you can either create it by using hcDocument in models it or create an object in the format on your own.
The constructor takes the following
- files: array of native Files, you usually get the File objects as a FileList from an HTML input element
- type: string, 'Document' by default
- title: string
- creationDate: date, the current Date by default
- author: string

```html
  <form>
    <input type="file" id="files" multiple>
    <button type="button" onclick="uploadDocument(document.getElementById('files').files)">Upload Documents</button>
  </form>
  <script>
    createDocument = (fileList) => {
    	let files = [...fileList];
    	return new HC.models.HCDocument({ files })
    }
  </script>
```

The resulting object has the following attributes:
- attachments: Attachments created from the files
- type: string
- creationDate: date
- title: string
- author: string
- id: string, created by platform on upload, do not change

#### Attachment
An attachment contains the file specific data.
```javascript
let hcAttachment = new HC.models.Attachment({file});
```
The resulting object has the following attributes:
- file: a js-file
- title: string, by default extracted from the file object
- type: string, by default extracted from the file object
- creationDate: date, by default extracted from the file object;

#### Upload Document
Uploading a document requires a logged in user.
The SDK encrypts the data before uploading it to the GesundheitsCloud.
Only the owner of the documents and those who have explicit permission from the owner are able to download the documents.

To upload the document:
```javascript
 HC.uploadDocument('user_id', hcDocument)
    .then((hcDocument) => {
        // the uploaded hcDocument with id
    })
    .catch((error) => {
        // error contains the status and error message
    });
```

#### Download Document
To download the document multiple requirements need to be fulfilled:
  - A user is logged in.
  - The logged in user has the right to access the document.
    - The user is the owner of the document
    - The user has the owners permission to access the document.

To download the document call downloadDocument providing the owners user id and the document id
```javascript
  HC.downloadDocument('user_id','document_id').then((hcDocument) => {
    // the requested hcDocument
  })
  .catch((error) => {
    // error contains the status
  })
```

The response is a hcDocument with the js file-object

In case the user does not have the right to access the document an error will be thrown.

In the case of any error in uploading and downloading documents, the format is:
```json
    {
        "status": 403,
        "error": {}
    }
```

#### Update a Document
For changing a Document you simply change the hcDocument Object.
It is important to call ``updateDocument('user_id', hcDocument)`` afterwards to sync the object with the GesundheitsCloud.
There are multiple attributes that should not be changed:
 * the ID of the Document or its Attachments
 * the file of an Attachment

##### Add files to existing docuement

Adding files to a document requires a logged in user.
Therefore you need to create attachments and push them to the attachments array of the hcDocument.
It is important to call ``updateDocument('user_id', hcDocument)`` afterwards to sync the object with the GesundheitsCloud.

```javascript
    let hcAttachment = new HC.models.Attachment({ file });
    hcDocument.attachments.push(hcAttachment);

    HC.updateDocument(userId, hcDocument)
        .then((hcDocument) => {
           // the updated hcDocument
       })
       .catch((error) => {
           // error contains the status and error message
       });
```

##### Remove files from an existing document
Removing files from a document requires a logged in user.
Therefore you need to remove the corresponding attachments from the attachments of the hcDocument.
It is important to call ``updateDocument('user_id', hcDocument)`` afterwards to sync the object with the GesundheitsCloud.

```javascript
    hcDocument.attachments.pop(0);

    HC.updateDocument(userId, hcDocument)
        .then((hcDocument) => {
           // the updated hcDocument
       })
       .catch((error) => {
           // error contains the status and error message
       });
```

#### Delete a Document

To delete a Document from the GesundheitsCloud call:
```javascript
    HC.deleteDocument(userId, hcDocument)
```
Thereby ``hcDocument`` is a HealthCloud-Document

#### List documents of a user (without files)

By calling ``getDocuments`` all documents of the user logged in can be received. ``downloadDocument`` can then be called to get an individual document blob.

```javascript
    HC.getDocuments()
        .then(documents => {});
```
For filtering those Documents you can add an object of parameters to the call. Possible parameters are:
```
 limit (optional, number) ... Maximum number of records to retrieve. Defaults to some sensible value (20?) if no value is provided. Has a sensible max (100?).
 offset (optional, number) ... Number of records to skip when retrieving. Defaults to 0 if no value is provided.
 start_date (optional, date) ... Earliest date for which to return records
 end_date (optional, date) ... Latest date for which to return records
```

### Share data with another user

In order to share all data of the current user with another Gesundheitscloud's user, namely *grantee*, call:

```javascript
    HC.grantPermission('granteeEmailAddress')
```

### Logout

To logout from Gesundheitscloud call:
```javascript
    HC.logout()
        .then((response) => {
        })
        .catch((error) => {
        });
```
