# GesundheitsCloud Web SDK
The GesundheitsCloud Javascript Web SDK allows you to store and access your users health data on the GesundheitsCloud platform and share it accross multiple users and applications.

For more information about the platform please visit [gesundheitscloud.de](https://www.gesundheitscloud.de/).

## Requirements
To use the SDK, you need to create a client id from GesundheitsCloud. Please get in touch with us at info@gesundheitscloud.de.

## Using the SDK
1.  You can eiter build the SDK(Read more about building the SDK in README.md) hosted by yourself or you simply import it from the provided URL.
It inserts a GC object into the global namespace.
```   html
 <script src="${url}/healthcloud_sdk.js"></script>
```

2. For logging a user in, you need to implement the OAuth2.0 code grant flow, which redirects the user to the GesundheitsCloud WebApp for login.
Thereby you will additionally have to create an asymmetric keypair by calling GC.SDK.createCAP. The public key of the user needs to send to our backend, while the private key needs to be stored in your OAuth backend.
As an Alternative we provide a GesunheitsCloud AuthSDK, which combined with the corresponding AuthService has the Flow implemented already. When using the AuthSDK simply call GC.AUTH.login('client_id')

3. When using the the authSDK, this step is included in the login method.
Initialise the SDK, providing your client id:
```javascript
    GC.SDK.setup(
        clientId,               // clientId of the application that uses the sdk
        privateKey,             // privateKey of the user logged in
        requestAccessToken);    // callback for requesting a valid accessToken
```

4. The following methods are available:
    - getCurrentUserId
    - grantPermission
    - getReceivedPermissions
    - downloadDocument
    - deleteDocument
    - uploadDocument
    - updateDocument
    - getDocuments
    - getDocumentsCount
    - createCAP
    - logout


### getCurrentUserId
You can get the id of the logged in user synchronously calling getCurrentUserId.

#### Sample Call
```javascript
const userId = GC.SDK.getCurrentUserId();
```

#### Sample Response
```javascript
'1cf5ee52-88dc-406a-bf7b-bc5e26a17b47'
```

#### Parameter
| Name | Type | Description |
|------|:-----|:------------|

#### Returns
| Property | Type | Description |
|----------|:-----|:------------|
| id | String | The id of the logged in user. |


### grantPermission
You can allow another user to access data of the logged in user.

#### Sample Call
```javascript
GC.SDK.grantPermission('1cf5ee52-88dc-406a-bf7b-bc5e26a17b47', ['annotation']).then(...)
```

#### Parameter
| Name | Type | Description |
|------|:-----|:------------|
| appId | String | The appId the data should be shared with. |
| annotations | [String] | Only records with those annotations will be shared. |

#### Resolves
| Property | Type | Description |
|----------|:-----|:------------|
|  |  |  |



### getReceivedPermissions
You can get information about all permissions you received.

#### Sample Call
```javascript
GC.SDK.getReceivedPermissions().then(...)
```

#### Sample Response
```javascript
{
    appId: '227ca002-db96-4175-9f10-d5ff6745259d',
    commonKey: 'CmqrvHd/Dmi8/b+m4MmjH19vlqfkIAz65Yr4UFZhwtLSGUBQQN2KaFcbRAf/jE/7lsywMqGz3H8dPnezLBnlHuA6D04+tvZupPKGe2YPD7tph8P2S3ujjpG/pq9s8qBRMj9jPZp6642dR7P8vlQcgah4mSNIjh2bMkbzmMTL1+79obUcVvxPUeTXMT1B0Ah65NxzqWrbevC83LgBUjk9+8fwwYXryIPXE7OUG7uj54t6xMIk6UiZfRRCXO4xEDbvTTyOF9mdrXDTgd8o6YYtcGyfKXC9IGv2ZB6tFPChp4wxbnzDkGWDOx5utzYb6rCR+y/YlYXwmjYeRrh0nr1pHw==',
    grantee: 'cf06c003-5f3f-499c-a14f-4868fba3487a',
    granteePublicKey: 'eyJ0IjoiYXB1YiIsInYiOjEsInB1YiI6Ik1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBdkNRTGQ3NjNjL3VPTFl4WHFaWkQ5eVcvOFZDTEFQZ29oRFpsNjUvNUpmUzZMeWdBeU5qSDBIUE85MlRNcHl3SmZ5dGVDbGJaQmo0SUJoTlNkL3pUS3NuREY0RmNhY3plQzgxRVZlWUx3SFpGTnJUL2tQUUZuTERNNWYrWUxUVVZHM1JaRUpsblgwSXM2VS82VGdTS1dnYlhnWG9yYW9KT0tjY0pyZG1YemNpbmY4ZGxwc2hEandPV3c1cDM4d1ZqL0E5UXNwUTFZV1MyOXUvc1EyNElmZFh0WXIwcCsxT3JtS0l5TFhJVTBxTEdUNGtBbWprYlZFdUl0YmxlcXJlS25paFhOVTVMSDdXeFJNUEdRQlZKMHNMRGY4M0RVVHFwT3ZUQ0hKVy9JVklUMG5QeSs0WEJtcnVRVEhOQ3g2OFdkclRnb0c1bGQ4U2NNczkwYnBUdDR3SURBUUFCIn0=',
    id: '177cca07-95ce-47e4-968c-2e36d70c87b6',
    owner: 'cf06c003-5f3f-499c-a14f-4868fba3487a',
    scope: ["exc", "perm:r", "perm:w", "rec:r", "rec:w", "attachment:r", "attachment:w", "user:r", "user:w", "user:q"]
}
```

#### Parameter
| Name | Type | Description |
|------|:-----|:------------|

#### Resolves
| Property | Type | Description |
|----------|:-----|:------------|
| appId | String |  |
| commonKey | String |  |
| grantee | String |  |
| granteePublicKey | String |  |
| id | String |  |
| owner | String |  |
| scope | [String] |  |


### uploadDocument
You can upload hcDocument for the logged in user or users he got permissionn to do so to the GesunheisCloud.

#### Sample Call
```javascript
GC.SDK.uploadDocument('1cf5ee52-88dc-406a-bf7b-bc5e26a17b47', hcDocument).then(...)
```

#### Sample Response
```javascript
{
    attachments: [{
        file: {},
        title: "Screen Shot 2018-05-03 at 15.40.15.png",
        type: "image/png",
        creationDate: "2018-05-03T13:40:18.190Z",
        id: "219d6639-af8c-4a7c-9df4-15adddd82aa2"
    }],
    type: "Document",
    creationDate: "2018-05-07T10:09:09.394Z",
    title:"asd",
    author: { firstName: "Max" },
    id: "f843456a-81c2-471d-9f55-ae3317171547"
}
```

#### Parameter
| Name | Type | Description |
|------|:-----|:------------|
| hcDocument | hcDocument | The hcDocument you want to upload. |

#### Resolves
| Property | Type | Description |
|----------|:-----|:------------|
| hcDocument | hcDocument | The hcDocument you wanted to upload with id and attachmentIds. |


### downloadDocument
You can download hcDocuments you uploaded or received permissionn to access.

#### Sample Call
```javascript
GC.SDK.downloadDocument('1cf5ee52-88dc-406a-bf7b-bc5e26a17b47', 'f843456a-81c2-471d-9f55-ae3317171547').then(...)
```

#### Sample Response
```javascript
{
    attachments: [{
        file: {},
        title: "Screen Shot 2018-05-03 at 15.40.15.png",
        type: "image/png",
        creationDate: "2018-05-03T13:40:18.190Z",
        id: "219d6639-af8c-4a7c-9df4-15adddd82aa2"
    }],
    type: "Document",
    creationDate: "2018-05-07T10:09:09.394Z",
    title: "title",
    author: { firstName: "Max" },
    id: "f843456a-81c2-471d-9f55-ae3317171547"
}
```

#### Parameter
| Name | Type | Description |
|------|:-----|:------------|
| ownerId | String |  |
| documentId | String |  |

#### Returns
| Property | Type | Description |
|----------|:-----|:------------|
| hcDocument | hcDocument | The requested hcDocument |


### deleteDocument
You can delete documents.

#### Sample Call
```javascript
GC.SDK.deleteDocument('196e897f-c60f-44db-8507-d5f67022a11f', 'f843456a-81c2-471d-9f55-ae3317171547').then(...)
```

#### Parameter
| Name | Type | Description |
|------|:-----|:------------|
| ownerId | String |  |
| documentId | String |  |

#### Resolves
| Property | Type | Description |
|----------|:-----|:------------|


### updateDocument
You can update documents that are already uploaded.

#### Sample Call
```javascript
GC.SDK.updateDocument('196e897f-c60f-44db-8507-d5f67022a11f', hcDocument).then(...)
```

#### Sample Response
```javascript
{
    attachments: [{
        file: {},
        title: "Screen Shot 2018-05-03 at 15.40.15.png",
        type: "image/png",
        creationDate: "2018-05-03T13:40:18.190Z",
        id: "219d6639-af8c-4a7c-9df4-15adddd82aa2"
    }],
    type: "Document",
    creationDate: "2018-05-07T10:09:09.394Z",
    title:"updated title",
    author: { firstName: "Max" },
    id: "f843456a-81c2-471d-9f55-ae3317171547"
}
```

#### Parameter
| Name | Type | Description |
|------|:-----|:------------|
| ownerId | String | The owners id of the document you want to update |
| hcDocument | hcDocument | The updated version of the document you want to update |

#### Resolves
| Property | Type | Description |
|----------|:-----|:------------|
| hcDocument | hcDocument | The upadted document |


### getDocuments
You can diplay all the documents of a user you got permission to.

#### Sample Call
```javascript
GC.SDK.getDocuments('196e897f-c60f-44db-8507-d5f67022a11f', options).then(...)
```

#### Sample Response
```javascript
{
    totalCount: 6,
    recors: [HCDocument, HCDocument, HCDocument, HCDocument, HCDocument, HCDocument]
```

#### Parameter
| Name | Type | Description |
|------|:-----|:------------|
| ownerId | String | The id of the owner of the documents. |
| options | Object | Options |

##### Options
| Name | Type | Description |
|------|:-----|:------------|
| client_id | String | (optional) |
| limit | String | (optional, default: 20) Maximum number of documents to retrieve. |
| offset | String | (optional, default: 0) Number of records to skip when retrieving. |
| start_date | Date |(optional) Earliest date for which to return records. |
| end_date | Date | (optional) Latest date for which to return records. |

#### Resolves
| Property | Type | Description |
|----------|:-----|:------------|
| hcDocuments | [hcDocument] | The documents of the user, but without the actual files. |
| documentsCount | Number | The amount of documents of the user. |


### getDocumentsCount
You can get the amount of documents of a user.

#### Sample Call
```javascript
GC.SDK.getDocumentsCount('196e897f-c60f-44db-8507-d5f67022a11f').then(...)
```

#### Sample Response
```javascript
6
```

#### Parameter
| Name | Type | Description |
|------|:-----|:------------|
| ownerId | String | The id of the owner of the documents. |

#### Resolves
| Property | Type | Description |
|----------|:-----|:------------|
| documentsCount | Number | The amount of documents of the user. |



### createCAP
You can create an asymmetric keypair.

#### Sample Call
```javascript
GC.SDK.createCAP()
```

#### Sample Response
```javascript
{
    publicKey: "eyJ0IjoiYXB1YiIsInYiOjEsInB1YiI6Ik1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBcnF0aGl6YkJVQVQ5ZHpWZm1sczUvd2RCdnZXc1lNTHNsVXVCalNlVlhFaVNBWEVmdXRzNDN4Ty82S0ZlTnoxV0krUVRhTUFLbTRBdWtxemwxMDEvNExBaFk0RzdIQTBuWnlDLzZidXlpb2w2c2xSZTVyVERBZS9tMEljb0xnVFZzczZsU3lBdFhPcDZOOS9rUUd1dG5JN0FpT2x5YWw0b0g0cVhHRWJjMVh2Kyt4aUJyeUZXM2NDTHcxU1RmWjhTYzFYa2Fmb3UyRVBVc3dXK3ZYZ28waHZQUU91c1JZWWo2UG83aFZPOHFIZk01TUptWE9vWDhPUlNzQTF2WGovSEE1Q254TWN3TUw5dUt6UW03MGZ3dWxwRlM4RFhwNlRmdzJQMUZtQktSR1RxRUcrUGhlc0NVTEI3dWl1cnZtRTAzZXh4bW1zaUdOSFJtKzlEVHZwS0FRSURBUUFCIn0=",
    privateKey: "eyJ0IjoiYXByaXYiLCJ2IjoxLCJwcml2IjoiTUlJRXZRSUJBREFOQmdrcWhraUc5dzBCQVFFRkFBU0NCS2N3Z2dTakFnRUFBb0lCQVFDdXEyR0xOc0ZRQlAxM05WK2FXem4vQjBHKzlheGd3dXlWUzRHTko1VmNTSklCY1IrNjJ6amZFNy9vb1Y0M1BWWWo1Qk5vd0FxYmdDNlNyT1hYVFgvZ3NDRmpnYnNjRFNkbklML3B1N0tLaVhxeVZGN210TU1CNytiUWh5Z3VCTld5enFWTElDMWM2bm8zMytSQWE2MmNqc0NJNlhKcVhpZ2ZpcGNZUnR6VmUvNzdHSUd2SVZiZHdJdkRWSk45bnhKelZlUnAraTdZUTlTekJiNjllQ2pTRzg5QTY2eEZoaVBvK2p1RlU3eW9kOHprd21aYzZoZnc1Rkt3RFc5ZVA4Y0RrS2ZFeHpBd3YyNHJOQ2J2Ui9DNldrVkx3TmVucE4vRFkvVVdZRXBFWk9vUWI0K0Y2d0pRc0h1Nks2dStZVFRkN0hHYWF5SVkwZEdiNzBOTytrb0JBZ01CQUFFQ2dnRUFDcU1rUngxTllONnFRdjFzb09nSHNhalMrbHF0ZTBlK1diU1FvMTh5NjVKVEswNzZMdC9WUGFkUEZpU1JxaUtNVEVEdEQ2dzJXU21td2NiOEhsbTVaOGtYZ2g4RW5VZU55K3d2Zm9BRm9RWG1BNENRNFAyY0xLZUdzbnl3clR0eWVqZTNLRXFXM2ZtU1Q0bk5OWlo1S3d6UE1UeXFVUFpYL04wWFU0MVQ1ZXBUd29IWkNicno5N3RoTGJOTG1hK3VlNUZTaUQ4c3Fkb1BwNndOTkMydHBrZXU3UlVkaXg2YWdMRk9yN2Vzby8rcWZPY1hDZitCb3UzWDYwUC8wM2pXWXhId1JmNXZPV1ZackJrZ2pjOThJREU2aVBadEc5M2xIdzhkaEs3bWdFS0lMTlZOdUU4U2FJdm1Vd1RUVStpU0xmSlN6YnVweDBKcDlrSDRvcHI4MHdLQmdRRHhpcW1oaXVxT3NZc1ZGV2JYMEtvV3JidnBjZ1pJOGxzVXFxT3d5K1RDZWdBaHd0QTFiajhxQWVuOXVraldQeDFqOWhYYXNVZGlCZ2IwZHFQL0l0ZUhoUFVaRFlqWjRDTU8rOHlmNTVDK0RkQUlIaUx3MnJHVi9wL1BSdTVyZUVheTliRjB5WFBOWGdRbUlySndXRklnc1MxN3kza2lEY1BDYnBhTTRkQnhGd0tCZ1FDNUgvdGRQcWJRWWJPN2J5SzZGWDFoYTUrTjVDbVhJV1dYT1VSZ0l4bkc0VWttejJkMnlIajB3SlIzYVlDMGpUcy9wRjhoWHhSaDRxVXJHS3c4YmNldHIyWUgxMGVVdVpMb0U5TmZNOEhPaVpwUzdtc2JoRlRBalJ1dmRlWElxSDcwcVpEbkRWeVMrTlVZRFpIeWRHRXlJM1MxKzl0MjN0d1VLSktBR3E0Y3B3S0JnRVM4YXcxM2xNeEtwZ08zOVc1UkNUWXU5cHkyUUNlZUlHRS9OaG5uekErejNEbS9VTFVEektITnJhTHcwaTEyQkkwZnlKUlZnclRZZGo0M1RQQWNJQzJHbnFFa2d0OU5zMnhlSjVzUnNOVUU1VUNLSXZOYnFOSEFoZ1hjYjVqUnYzektBbGZ6eENxYktKOFpuS0h2NEY5QlRHcEFPeFoveUVlYVpPbHVrWHk5QW9HQUoyekZObjF5UHl5ZmYwcFN4Zmh2cEVDc1VTYUhLUFZtMGtiUzVmcHpzZVFtbFFwVWlYcDJNQUdYWExydU93VmMyZGZpbnBQR0huYUxJRnQzeXNMQ1pKM1hCOUowSHh0S1N2eDE1bTk2VmNiK1E2MGN5Rlp0U2ppQzdlSVkxcHZ6dFowckM5blBua2s1OEk1clI0dzdhdGNjTXVsNU9wNkpsZzF4N2JCQTVqOENnWUVBaU4rMlIrbWlYcmNOTUpLVXlpNDF6QkV4aVBvbjQrVmhxVDgwR1hQRWxsZUpWeUcyYjBJOVZtZzVBRXVaTkZQZmR4UG1mN05LaTJJaTFGZk1ST0JyeEo0TlB5TVVZY2svbGlhT3o4RzNXNFhBVWtHQ2RSK2VJeTlsRGtrNFhHN2E3L21sUkYzR1ZkOGtHcXpUWkVRS2lwV0V1OHUxNzN4WEE4ak1LbURGdmQwPSJ9"
}
```

#### Parameter
| Name | Type | Description |
|------|:-----|:------------|

#### Resolves
| Property | Type | Description |
|----------|:-----|:------------|
| publicKey | String | A base64 encoded publicKey |
| privateKey | String | A base74 encoded privateKey |


### reset
You can reset the SDK

#### Sample Call
```javascript
    GC.SDK.reset()
```

#### Parameter
| Name | Type | Description |
|------|:-----|:------------|

#### Resolves
| Property | Type | Description |
|----------|:-----|:------------|


### Models
The GesundheisCloud supports multiple resourcetypes. Those are reflected in the models.

#### HCDocument
##### Sample Construction
```javascript
<form>
    <input type="file" id="files" multiple>
    <button type="button" onclick="uploadDocument(document.getElementById('files').files)">Upload Documents</button>
</form>
<script>
    createDocument = (fileList) => {
        let files = [...fileList];
        return new GC.SDK.models.HCDocument({
            files,
            title: 'MRT',
            author: new GC.SDK.models.HCAuthor({ firstName: 'Ruslan' }),
            additionalIds: { [clientId]: 'custom-document-id' },
        })
    }
</script>
```

##### Parameter
| Name | Type | Description |
|------|:-----|:------------|
| files | [File] | The files you want to attach. |
| type | String | The type of the document. |
| title | String | The title of the Document. |
| creationDate | Date | The date of creation. |
| author | hcAuthor | The author of the document. |
| additionalIds | Object | A way to set your internal id of the document. |
| annotations | [String] | You can later filter for those annotations. |


#### HCAuthor
An Author contains information about the author of document.

##### Sample Construction
```javascript
let hcAuthor = new HC.models.Author({
    firstName = 'Ruslan'
    prefix = 'Dr.'
});
```

##### Parameter
| Name | Type | Description |
|------|:-----|:------------|
| identifier | String | custom identifier |
| firstName | String |  |
| lastName | String |  |
| prefix | String | eg. Capt., Mr., Mrs. |
| suffix | String | eg. Sr., Late |
| street | String |  |
| city | String |  |
| postalCode | String |  |
| telephone | String |  |
| website | String |  |
| specialty | Number | (standard set of codes are allowed in specialty value. Refer https://www.hl7.org/fhir/valueset-c80-practice-codes.html. Reflected in HCSpeciality)

#### HCSpecialty
Specialty is an enum, which has standard set of codes corresponding to the specialty of author.
The complete list of specialties can be found at https://www.hl7.org/fhir/valueset-c80-practice-codes.html

##### Sample Construction
```javascript
HC.models.Specialty.AdultMentalIllness // equals 408467006
```


#### HCAttachment
An attachment contains the file specific data.
```javascript
let hcAttachment = new HC.models.Attachment({ file });
```

##### Parameter
| Name | Type | Description |
|------|:-----|:------------|
| file | File | A JS-File object |
| title | String | (optional) extracted from the file object by default |
| type | String | (optional) extracted from the file object by default |
| creationDate | Date | extracted from the file object by default |

