import Ajv from 'ajv';
import HCDocument from '../HCDocument';
import hcAttachmentUtils, { schema as attachmentSchema } from './hcAttachmentUtils';
import hcAuthorUtils, { schema as authorSchema } from './hcAuthorUtils';
import hcSpecialtyUtils from './hcSpecialtyUtils';

const schema = {
    type: 'object',
    properties: {
        title: { type: 'string' },
        author: authorSchema,
        additionalIds: {
            type: 'object',
        },
        type: { type: 'string' },
        attachments: {
            type: 'array',
            items: attachmentSchema,
        },
        id: { type: 'string' },
        annotations: {
            type: 'array',
            items: {
                type: 'string',
                maxLength: 256,
            },
            maxLength: 16,
        },
    },
    required: ['title', 'attachments', 'type'],
};
const ajv = new Ajv();
const validate = ajv.compile(schema);

const hcDocumentUtils = {
    isValid(hcDocument) {
        return validate(hcDocument);
    },

    fromFhirObject(fhirObject) {
        const hcDocument = new HCDocument({
            type: fhirObject.type.text,
            creationDate: new Date(fhirObject.indexed),
            title: fhirObject.description,
            additionalIds: fhirObject.identifier && fhirObject.identifier.length > 0
                ? fhirObject.identifier
                    .reduce((obj, item) => {
                        obj[item.assigner.reference] = item.value;
                        return obj;
                    })
                : undefined,
        });
        hcDocument.attachments = fhirObject.content ? fhirObject.content.map(content =>
            hcAttachmentUtils.fromFhirObject(content.attachment)) : [];
        // fhirObject.author contains the reference id to the author in contained array.
        if (fhirObject.contained && fhirObject.contained.length > 0) {
            const author = fhirObject.contained.find((el => el.id === 'contained-author-id'));
            hcDocument.author = author ? hcAuthorUtils.fromFhirObject(author) : '';
        }
        return hcDocument;
    },

    toFhirObject(hcDocument, clientId) {
        const fhirObject = {
            resourceType: 'DocumentReference',
            status: 'current',
            type: { text: hcDocument.type },
            indexed: hcDocument.creationDate.toISOString(),
            author: [{ reference: '#contained-author-id' }],
            description: hcDocument.title,
            subject: { reference: hcDocument.title },
        };
        fhirObject.content = hcDocument.attachments ? hcDocument.attachments.map(attachment =>
            ({ attachment: hcAttachmentUtils.toFhirObject(attachment) })) : [];

        fhirObject.contained = [hcAuthorUtils.toFhirObject(hcDocument.author, clientId)];
        if (hcDocument.additionalIds) {
            fhirObject.identifier = Object.keys(hcDocument.additionalIds).map(key => ({
                value: hcDocument.additionalIds[key],
                assigner: {
                    reference: key,
                },
            }));
        }
        // Information about where the document was created.
        if (hcDocument.author.specialty) {
            fhirObject.context = {
                practiceSetting: {
                    coding: [{
                        display: hcSpecialtyUtils.display(hcDocument.author.specialty),
                        code: hcDocument.author.specialty,
                    }],
                },
            };
        }
        return fhirObject;
    },
};

export default hcDocumentUtils;
