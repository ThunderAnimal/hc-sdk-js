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
    - getLoginForm
		- getRegistrationForm
		- downloadDocument
		- uploadDocument
		- getUser
		- updateUser
		- searchRecords
		- uploadFhirRecord
		- downloadFhirRecord
		- updateFhirRecord
		- deleteRecord
		- grantPermission
		- logout

#### Register
To register a user, append the registration form to a node.
Therefore you need to call  ``HC.getRegistrationForm(parent_node, callback)``.
Hence the form is then appended to ``parent_node``.
``getRegistrationForm`` returns a promise that will be resolved or rejected when user tries to register.

```html
<div id="gesundheitsregister"></div>
```
```javascript
HC.getRegistrationForm(document.getElementById("gesundheitsregister"))
.then((response) => {
  // User successfully registered
})
.catch((error) => {
  // Error on register
});
```

In the case of a successful registration, ``error`` is contains a message, and ``response`` contains the user id as below.
```json
    {
        "user_alias": "hcUserAlias"
    }
```

The user will need to login after registration.

#### Login
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

#### Get the Current UserId and Alias
You can get the currently active user synchronously by calling getUserIdAndAlias.

```javascript
 HC.getUserIdAndAlias();
```
In case of a logged in user getUserIdAndAlias returns a basic user object.
```json
{   
    "user_alias": "user_alias",
    "user_id": "user_id"
}
```
#### Get the Current User

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
				email: 'user_email',
				user_data: {
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


#### Upload Document
Uploading a document requires a logged in user.
The SDK encrypts the data before uploading it to the GesundheitsCloud.
Only the owner of the documents and those who have explicit permission from the owner are able to download the documents.

To upload the document:
```javascript
 let files = [new File()];

 HC.uploadDocument('user_id', files, documentReference)
    .then((response) => {
        // use document record which contains document id, status etc.
    })
    .catch((error) => {
        // error contains the status and error message
    });
```
where options is formed as per FHIR standard for document. (https://www.hl7.org/fhir/documentreference.html)
Example: https://www.hl7.org/fhir/documentreference-example.json

On Success, the response consists the documents metadata:
```json
{
     "record_id": "d6dc12e4-6e1d-4bfa-b49d-fa2f00d6f84a"     
}
```

#### Download Document
To download the document multiple requirements need to be fulfilled:
  - A user is logged in.
  - The logged in user has the right to access the document.
    - The user is the owner of the document
    - The user has the owners permission to access the document.

To download the document call downloadDocument providing the owners user id and the document id
```javascript
  HC.downloadDocument('user_id','record_id').then((response) => {
    // the response is the decrypted document
  })
  .catch((error) => {
    // error contains the status
  })
```

The response consists of document metadata and the decrypted body. eg. for an image file:

```json
  {  
      "record_id":"d6dc12e4-6e1d-4bfa-b49d-fa2f00d6f84a",
      "date":"2017-09-14",
      "user_id":"user1",
      // the FHIR format of the document data
      "body": {
        "content" : [
          {
            "attachment" : {
              "id": "file_id_1",
              "title": "given_title_1"
            }
          },{
            "attachment" : {
              "id": "file_id_2",
              "title": "given_title_2"
            }
          }
        ],
        "description" : "Title",
        "indexed" : "2017-10-18T13:58:12.809Z",
        "resourceType" : "DocumentReference",
        "status" : "current",
        "type" : {
          "text" : "concept"
        }
      },
      "tags":[  
         "tag1",
         "tag2"
      ],
      "version":1,
      "status":"Active",
      "createdAt":"2017-09-14T10:48:47.684",
      "document":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAeoAAAMECAYAAABwvGbhAAAMFGlDQ1BJQ0MgUHJvZmlsZQAASIm"                     
  }
```

In case the user does not have the right to access the document an error will be thrown.

In the case of any error in uploading and downloading documents, the format is:
```json
    {
        "status": 403,
        "error": {}
    }
```

#### Add files to existing docuement
Adding files to a document requires a logged in user.
Therefore you need to call ``addFilesToDocument`` and provide the document owners user id, the document id and the files.
```javascript
    let files = [new File()];
    HC.addFilesToDocument(userId, documentId, files)
        .then((response) => {
            // use document record which contains document id, status etc.
        })
        .catch((error) => {
            // error contains the status and error message
        });
```

#### Remove files from an existing document
Removing files from a document requires a logged in user.
Therefore you need to call ``deleteFilesFromDocument`` and provide the document owners user id, the document id and the file ids that should be deleted.

```javascript
    HC.deleteFilesFromDocument(userId, documentId, fileIds)
        .then((response) => {
           // use document record which contains document id, status etc.
       })
       .catch((error) => {
           // error contains the status and error message
       });
```

### Upload a FHIR resource

To upload a record into Gesundheitscloud call:
```javascript
    HC.uploadFhirRecord(fhirJson)
```
The record should given as a Json object according to the FHIR standard.
Possible structures of the Json object can be viewed in FHIRs [Guide to resouces](https://hl7.org/fhir/DSTU2/resourceguide.html).

### Update a FHIR resource

To update a record into Gesundheitscloud call:
```javascript
    HC.updateFhirRecord(recordId, fhirJson)
```
The record should given as a Json object according to the FHIR standard.
Possible structures of the Json object can be viewed in FHIRs [Guide to resouces](https://hl7.org/fhir/DSTU2/resourceguide.html).

### Download a FHIR record

To download a record from Gesundheitscloud call:
```javascript
    HC.downloadFhirRecord(recordId)
```

This returns a promise that resolves to an object that contains ``tags`` and ``body``.
Thereby ``tags`` is an array of strings that contains automatically generated tags and ``body`` is the json object, that has been uploaded.

### Delete a record/document

To delete a record from Gesundheitscloud call:
```javascript
    HC.deleteRecord(recordId)
```

### Search for Records

``searchRecords(params)`` can be used to get all records that match the criteria given in params.
Thereby params is an object that can contain multiple criteria.

```
 user_ids (optional, array of strings) ... List of IDs of user whose records are to be searched.
 limit (optional, number) ... Maximum number of records to retrieve. Defaults to some sensible value (20?) if no value is provided. Has a sensible max (100?).
 offset (optional, number) ... Number of records to skip when retrieving. Defaults to 0 if no value is provided.
 start_date (optional, date) ... Earliest date for which to return records
 end_date (optional, date) ... Latest date for which to return records
```
To search for records, call :

```javascript
    HC.searchRecords(params)
        .then((response) => {
        })
        .catch((error) => {
            // error contains the status and error message
        });

```
where params can be :
```javascript
    {
        user_ids: ['user1', 'user2'],
        limit: 20,
        offset: 20,
        start_date: '2017-06-06',
        end_date: '2017-08-08',
    };
```
The response format is :
```json
    [{  
          "record_id":"d6dc12e4-6e1d-4bfa-b49d-fa2f00d6f84a",
          "date":"2017-09-14",
          "user_id":"user1",
          "body": {
            "resourceType":"Patient"
          },
          "tags":[  
             "tag1",
             "tag2"
          ],
          "version":1,
          "status":"Active",
          "createdAt":"2017-09-14T10:48:47.684"
       }]

```

### List all documents of a user

By calling ``getDocuments`` the metadata of all the documents of the user logged in can be received. ``downloadDocument`` can then be called to get an individual document blob.

```javascript
    HC.getDocuments();
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

### Sample Code
#### For uploading the document

```html
<form enctype="multipart/form-data">
    <input id="upload" type="file"   accept="image/png" name="files[]" size=30>
</form>
```

```javascript
    function handleFileSelect(evt) {
        let files = [...evt.target.files];

        HC.uploadDocument('user_id', files);
    }

    document.getElementById('upload').addEventListener('change', handleFileSelect, false);
```
