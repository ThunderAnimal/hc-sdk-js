/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import HCDocument from '../../../src/lib/models/HCDocument';
import hcDocumentUtils from '../../../src/lib/models/utils/hcDocumentUtils';

chai.use(sinonChai);

const expect = chai.expect;

describe('models/document', () => {
	const file = new File(['test'], 'testName');
	const files = [file, file];
	const date = new Date('Thu, 23 Nov 2017 22:57:55 GMT');
	const title = 'title';
	const type = 'type';
	const author = 'Glumli';
	const documentParameters = {
		files,
		author,
		creationDate: date,
		title,
		type,
	};

	beforeEach(() => {
	});

	it('constructor creates proper document', () => {
		const hcDocument = new HCDocument(documentParameters);
		expect(hcDocument.attachments.length).to.equal(2);
		expect(hcDocument.type).to.equal(type);
		expect(hcDocument.creationDate).to.equal(date);
		expect(hcDocument.author).to.equal(author);
		expect(hcDocument.title).to.equal(title);
	});

	it('converting a document to fhir and back doesn\'t'
		+ ' change the document(except the attachments)', () => {
		const hcDocument = new HCDocument(documentParameters);
		const fhirDocument = hcDocumentUtils.toFhirObject(hcDocument);
		const fhirGeneratedDocument = hcDocumentUtils.fromFhirObject(fhirDocument);
		expect(fhirGeneratedDocument.attachments.length).to.equal(hcDocument.attachments.length);
		hcDocument.attachments = [];
		fhirGeneratedDocument.attachments = [];
		expect(fhirGeneratedDocument).to.deep.equal(hcDocument);
	});

	it('constructed hcDocument is accepted by validate', () => {
		const hcDocument = new HCDocument(documentParameters);
		expect(hcDocumentUtils.isValid(hcDocument)).to.equal(true);
	});
});
