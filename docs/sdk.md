# GesundheitsCloud Web SDK
The GesundheitsCloud Javascript web SDK allows users to store health data on the GesundheitsCloud platform and share it to authorized people and applications.

For more information about the platform please see our [website](https://www.gesundheitscloud.de/).

## Requirements
To use the SDK, you need to create a client id from GesundheitsCloud. Please get in touch with us at info@gesundheitscloud.de.

## Usage
The SDK allows to upload and download the user's health-related data and documents and share them with other users.

The SDK compiles into a bundle, which can then be imported into the project.

## Bundling
Refer to README.md for bundling the SDK.

## Using the SDK

1.  Import the javascript file from the provided URL (see example below). You may need to modify the version number later.
It inserts a healthcloud_sdk object into the global namespace.
```   html
 <script src="${url}/healthcloud_sdk.js"></script>
```

2. ** TODO LOGIN **

3. Initialise the SDK, providing your client id:
```javascript
    var HC = new healthcloud_sdk(
        clientId,               // clientId of the application that uses the sdk
        userId,                 // userId of the logged in user
        privateKey,             // privateKey of the user logged in
        accessToken,            // accessToken of the user logged in
        requestAccessToken);    // callback for requesting a valid accessToken
```

4. The following functions are available:
    - downloadDocument
    - uploadDocument
    - updateDocument
    - deleteDocument
    - getDocuments
    - getDocumentsCount
    - getCurrentUser
    - getUser
    - updateUser
    - logout


### Get the current UserId
You can get the currently active user synchronously by calling getUserIdAndAlias.

```javascript
 HC.getCurrentUser();
```
Once logged in, getCurrentUser returns the userId.

### Get User

You can get the detailed user by calling ``getUser`` function, which returns a promise.

To get the user
```javascript
 HC.getUser(userId) // userId is optional: If unset, the currently logged in user is being used.
    .then((response) => {
    })
    .catch((error) => {
    });
```
where response is:
** TODO: what else **
```json
          {
                id: '93725dda-13e0-4105-bffb-fdcfd73d1db5',
                alias: 'user_email',
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
- author: Author
- additionalIds: Object containing a mapping between clientId and a documentId provided by the client
- id: string, created by platform on upload, do not change

#### Author
An Author contains information about the author of document.
```javascript
let hcAuthor = new HC.models.Author(options);
```
where options is an object containing the following attributes:
- identifier: string (custom identifier used for author)
- firstName: string
- lastName: string
- prefix: string (eg. Capt., Mr., Mrs.)
- suffix: string (eg Sr., Late)
- street: string
- city: string
- postalCode: string
- telephone: string
- website: string
- specialty: int (standard set of codes are allowed in specialty value.
  Refer https://www.hl7.org/fhir/valueset-c80-practice-codes.html. You can also use
  the Specialty enum defined below.)

#### Specialty
Specialty is an enum, which has standard set of codes corresponding to the specialty of author(practitionar)
```javascript
HC.models.Specialty.AdultMentalIllness is 408467006
```
The complete list of specialties can be found at https://www.hl7.org/fhir/valueset-c80-practice-codes.html


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
To download the document call downloadDocument providing the owners user id and a document id the logged in user has permission to access for.
```javascript
  HC.downloadDocument('user_id','document_id').then((hcDocument) => {
    // the requested hcDocument
  })
  .catch((error) => {
    // error contains the status
  })
```

The response is a hcDocument containing the js file-objects.

In case the user does not have the right to access the document an error will be thrown.


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
           // error containing an error message
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
           // error containing an error message
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
    HC.getDocuments(userId)
        .then(response => {});
```
For filtering those Documents you can add an object of parameters to the call. Possible parameters are:
```
 client_id (optional, string) ... clientId from which the records where uploaded.
 limit (optional, number) ... Maximum number of records to retrieve. Defaults to some sensible value (20?) if no value is provided. Has a sensible max (100?).
 offset (optional, number) ... Number of records to skip when retrieving. Defaults to 0 if no value is provided.
 start_date (optional, date) ... Earliest date for which to return records
 end_date (optional, date) ... Latest date for which to return records
```
The response is an object with total count and the list of documents (can be paginated list depending of the parameters passed.)

```javascript
   {
        totalCount: 10,
        records: []
   }
```

#### Total number of documents of a user (without files)

By calling ``getDocumentsCount``, the total count of documents owned by user can be recieved.

```javascript
    HC.getDocumentsCount(userId)
        .then(response => {});
```
You can also get the total count based on filters as discussed above.
The response will be an object with the totalCount parameter.

```javascript
   {
        totalCount: 10
   }
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
