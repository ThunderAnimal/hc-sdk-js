/* eslint-disable no-new */
/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import HCDocument from '../../../src/lib/models/HCDocument';
import HCAuthor from '../../../src/lib/models/HCAuthor';
import hcDocumentUtils from '../../../src/lib/models/utils/hcDocumentUtils';
import documentResources from '../../testUtils/documentResources';
import testVariables from '../../testUtils/testVariables';

chai.use(sinonChai);

const expect = chai.expect;

describe('models/document', () => {
    it('constructor creates proper document', () => {
        const hcDocument = new HCDocument(documentResources);
        expect(hcDocument.attachments.length).to.equal(2);
        expect(hcDocument.type).to.equal(documentResources.type);
        expect(hcDocument.creationDate).to.equal(documentResources.creationDate);
        expect(hcDocument.author.toString()).to.equal(documentResources.author.toString());
        expect(hcDocument.title).to.equal(documentResources.title);
        expect(hcDocument.annotations).to.equal(documentResources.annotations);
    });

    it('converting a document to fhir and back doesn\'t'
        + ' change the document(except the attachments)', () => {
        const hcDocument = new HCDocument(documentResources);
        const fhirDocument = hcDocumentUtils.toFhirObject(hcDocument);
        const fhirGeneratedDocument = hcDocumentUtils.fromFhirObject(fhirDocument);
        expect(fhirGeneratedDocument.attachments.length).to.equal(hcDocument.attachments.length);
        hcDocument.attachments = [];
        fhirGeneratedDocument.attachments = [];
        expect(fhirGeneratedDocument.toString()).to.deep.equal(hcDocument.toString());
    });

    it('fails to create hcDocument when parameters are invalid', () => {
        const documentParams = Object.assign({}, documentResources);
        documentParams.type = 1;
        try {
            new HCDocument(documentParams);
        } catch (error) {
            expect(error.name).to.equal('ValidationError');
        }
    });

    it('validates when correct format of hcDocument is passed', () => {
        documentResources.author = new HCAuthor(documentResources.author);
        const hcDocument = new HCDocument(documentResources);
        expect(hcDocumentUtils.isValid(hcDocument)).to.equal(true);
    });

    it('fails validation when wrong specialty is entered for author in hcDocument', () => {
        const hcDocument = new HCDocument(documentResources);
        hcDocument.author.specialty = 1235;
        expect(hcDocumentUtils.isValid(hcDocument)).to.equal(false);
    });

    it('fails validation when invalid annotation length is passed', () => {
        const hcDocument = new HCDocument({
            ...documentResources,
            annotations: [testVariables.invalidAnnotation],
        });
        expect(hcDocumentUtils.isValid(hcDocument)).to.equal(false);
    });

    it('fails validation when one of the attachments in hcDocument is of wrong format', () => {
        const hcDocument = new HCDocument(documentResources);
        hcDocument.attachments.push({ randomField: 'randomField' });
        expect(hcDocumentUtils.isValid(hcDocument)).to.equal(false);
    });

    it('fails validation when additionalIds in hcDocument are not an object', () => {
        const hcDocument = new HCDocument(documentResources);
        hcDocument.additionalIds = [];
        expect(hcDocumentUtils.isValid(hcDocument)).to.equal(false);
    });
});
