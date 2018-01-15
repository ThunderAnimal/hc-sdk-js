import testVariables from './testVariables';

const fhirResources = {
    documentReference: {
        resourceType: 'DocumentReference',
        status: 'current',
        type: {
            text: 'Document',
        },
        indexed: testVariables.dateTimeString,
        author: [{ display: 'Julius' }],
        subject: { reference: 'CT' },
        content: [{
            attachment: {
                id: testVariables.fileId,
                title: '20171214_131101.jpg',
                contentType: 'image/jpeg',
                creation: testVariables.dateTimeString,
            },
        }],
    },
    encryptedFhir: 'encryptedFhir',
};

export default fhirResources;
