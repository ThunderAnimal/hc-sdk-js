import Ajv from 'ajv';
import HCAttachment from '../HCAttachment';

const schema = {
    type: 'object',
    properties: {
        title: { type: 'string' },
        type: { type: 'string' },
    },
    required: [],
};

const ajv = new Ajv();
const validate = ajv.compile(schema);

const hcAttachmentUtils = {
    isValid(hcAttachment) {
        return validate(hcAttachment);
    },

    fromFhirObject(fhirObject) {
        const attachment = new HCAttachment({
            title: fhirObject.title,
            type: fhirObject.contentType,
            creationDate: new Date(fhirObject.creation),
        });
        attachment.id = fhirObject.id;
        return attachment;
    },

    toFhirObject(hcAttachment) {
        return {
            id: hcAttachment.id,
            title: hcAttachment.title,
            contentType: hcAttachment.type,
            creation: hcAttachment.creationDate.toISOString(),
        };
    },
};

export default hcAttachmentUtils;
