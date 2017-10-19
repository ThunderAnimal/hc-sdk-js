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
    "user_alias": "user_alias",
    "user_id": "user_id"
}
```

#### Upload Document
Uploading a document requires a logged in user.
The SDK encrypts the data before uploading it to the GesundheitsCloud.
Only the owner of the documents and those who have explicit permission from the owner are able to download the documents.

To upload the document:
```javascript
 HC.uploadDocument('user_id', file, options)
    .then((response) => {
        // use document metadata which contains document id,status etc.
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
        "resourceType":"DocumnetReference" 
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


### Upload a FHIR resource

To upload a record into Gesundheitscloud call: 
```javascript
    HC.uploadFhirRecord(fhirJson, tags)
```
The record should given as a Json object according to the FHIR standard.
Possible structures of the Json object can be viewed in FHIRs [Guide to resouces](https://hl7.org/fhir/DSTU2/resourceguide.html). 
``tags`` is optional and enables you add custom tags to your record. Therefore ``tags`` expected to be an array of strings.
It is important to note, that all tags are also stored encrypted.

### Download a FHIR record

To download a record from Gesundheitscloud call:
```javascript
    HC.downloadFhirRecord(recordId)
```

This returns a promise that resolves to an object that contains ``tags`` and ``body``.
Thereby ``tags`` is an array of strings that contains not only the custom but automatically created tags and ``body`` is the json object, that has been uploaded.

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
 tags (optional, array of strings) ... List of tags on which to search. Only records that have all the provided tags are returned.
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
        tags: ['tag1', 'tag2']
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

By passing ``tags: ['document']`` as parameter to ``searchRecords(params)`` a list of all documents metadata will be received. ``downloadDocument`` can then be called to get an individual document blob.

```javascript
    HC.searchRecords({
        user_ids: ['user1'],
        tags: ['document']
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
