import HCAttachment from '../HCAttachment';

export const schema = {
    type: 'object',
    properties: {
        title: { type: 'string' },
        type: { type: 'string' },
    },
    required: [],
};

const hcAttachmentUtils = {
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
