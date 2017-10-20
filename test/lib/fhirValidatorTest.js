/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import Ajv from 'ajv';

import fhirRoutes from '../../src/routes/fhirRoutes';
import fhirValidator from '../../src/lib/fhirValidator';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;


describe('fhir validator', () => {
	const schema = {
		resources: {
			DocumentReference: {
				title: 'DocumentReference',
				type: 'object',
				additionalProperties: false,
				properties: {
					resourceType: {
						enum: [
							'DocumentReference',
						],
					},
					id: {
						pattern: '[abc]',
					},
				},
				required: [
					'resourceType',
				],
			},
		},
		types: {},
	};
	let fhirRouteStub;

	beforeEach(() => {
		fhirRouteStub = sinon.stub(fhirRoutes, 'getFhirSchema')
			.returnsPromise().resolves(JSON.stringify(schema));
	});

	it('getConformance succeeds', (done) => {
		fhirValidator.getConformance()
			.then((res) => {
				expect(res.types.toString()).to.equal(schema.types.toString());
				done();
			});
	});


	it('isValidResourceType succeeds', (done) => {
		fhirValidator.isValidResourceType('DocumentReference')
			.then((res) => {
				expect(res).to.not.be.null;
				expect(res).to.equal(true);
				done();
			});
	});

	it('isValidResourceType fails for invalid resource', (done) => {
		fhirValidator.isValidResourceType('Document')
			.catch((err) => {
				expect(err).to.not.be.null;
				expect(err).to.equal(false);
				done();
			});
	});

	it('validate succeeds', (done) => {
		const dummyObject = { resourceType: 'DocumentReference' };

		fhirValidator.validate(dummyObject)
			.then((res) => {
				expect(res).to.not.be.null;
				done();
			});
	});

	it('validate fails if invalid resource type', (done) => {
		const dummyObject = { resourceType: 'Document' };

		const ajvSpy = sinon.spy(Ajv.prototype, 'compile');

		fhirValidator.validate(dummyObject)
			.catch((err) => {
				expect(err).to.not.be.null;
				expect(ajvSpy).to.not.be.called;
				Ajv.prototype.compile.restore();
				done();
			});
	});

	it('validate fails if object passed doesn\' match the schema', (done) => {
		const dummyObject = { resourceType: 'DocumentReference', id: '1' };

		const ajvSpy = sinon.spy(Ajv.prototype, 'compile');

		fhirValidator.validate(dummyObject)
			.catch((err) => {
				expect(err).to.not.be.null;
				expect(ajvSpy).to.be.calledOnce;
				done();
			});
	});

	afterEach(() => {
		fhirRouteStub.restore();
	});
});
