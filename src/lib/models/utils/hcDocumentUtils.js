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
                    }, {})
                : undefined,
            author: {},
        });
        hcDocument.attachments = fhirObject.content ? fhirObject.content.map(content =>
            hcAttachmentUtils.fromFhirObject(content.attachment)) : [];
        // fhirObject.author contains the reference id to the author in contained array.
        if (fhirObject.contained && fhirObject.contained.length > 0) {
            const author = fhirObject.contained.find((el => el.id === 'contained-author-id'));
            hcDocument.author = author ? hcAuthorUtils.fromFhirObject(author) : {};
        }

        if (fhirObject.context && fhirObject.context.practiceSetting) {
            hcDocument.author.specialty = hcSpecialtyUtils.fromFhirCodeableConcept(
                fhirObject.context.practiceSetting,
            );
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
            contained: [],
        };
        fhirObject.content = hcDocument.attachments ? hcDocument.attachments.map(attachment =>
            ({ attachment: hcAttachmentUtils.toFhirObject(attachment) })) : [];

        if (hcDocument.author) {
            fhirObject.contained.push(hcAuthorUtils.toFhirObject(hcDocument.author, clientId));
        }

        // Information about where the document was created.
        if (hcDocument.author && hcDocument.author.specialty) {
            fhirObject.context = {
                practiceSetting: hcSpecialtyUtils.toFhirCodeableConcept(
                    hcDocument.author.specialty,
                ),
            };
        }

        if (hcDocument.additionalIds) {
            fhirObject.identifier = Object.keys(hcDocument.additionalIds).map(key => ({
                value: hcDocument.additionalIds[key],
                assigner: {
                    reference: key,
                },
            }));
        }

        return fhirObject;
    },
};

export default hcDocumentUtils;
