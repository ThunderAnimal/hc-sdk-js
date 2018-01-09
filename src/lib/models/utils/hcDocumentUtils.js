import Ajv from 'ajv';
import HCDocument from '../HCDocument';
import hcAttachmentUtils from './hcAttachmentUtils';

const schema = {
	type: 'object',
	properties: {
		title: { type: 'string' },
		author: { type: 'string' },
		type: { type: 'string' },
		attachments: { type: 'array' },
		id: { type: 'string' },
	},
	required: ['title', 'attachments', 'type'],
};

const ajv = new Ajv();
const validate = ajv.compile(schema);

const hcDocumentUtils = {
	isValid(hcDocument) {
		return validate(hcDocument) &&
			hcDocument.attachments.every((attachment => hcAttachmentUtils.isValid(attachment)));
	},

	fromFhirObject(fhirObject) {
		const hcDocument = new HCDocument({
			type: fhirObject.type.text,
			creationDate: new Date(fhirObject.indexed),
			author: (fhirObject.author && fhirObject.author.length > 0) ? fhirObject.author[0].display : '',
			title: fhirObject.subject.reference,
		});
		hcDocument.attachments = fhirObject.content.map(content =>
			hcAttachmentUtils.fromFhirObject(content.attachment));

		return hcDocument;
	},

	toFhirObject(hcDocument) {
		const fhirObject = {
			resourceType: 'DocumentReference',
			status: 'current',
			type: { text: hcDocument.type },
			indexed: hcDocument.creationDate.toISOString(),
			author: [{ display: hcDocument.author }],
			subject: { reference: hcDocument.title },
		};
		fhirObject.content = hcDocument.attachments.map(attachment =>
			({ attachment: hcAttachmentUtils.toFhirObject(attachment) }));

		return fhirObject;
	},
};

export default hcDocumentUtils;
