/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';

import documentRoutes from '../../src/routes/documentRoutes';
import FhirService from '../../src/services/FhirService';
import UserService from '../../src/services/UserService';
import encryptionUtils from '../../src/lib/EncryptionUtils';
import FhirValidator from '../../src/lib/fhirValidator';
import fhirRoutes from '../../src/routes/fhirRoutes';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('fhir service', () => {
	let fhirService;
	let userServiceResolveUserStub;
	let resolveUserIdStub;

	const fhirObject = {
		resourceType: 'Patient',
		id: 'example',
		identifier: [
			{
				use: 'usual',
				type: {
					coding: [
						{
							system: 'http://hl7.org/fhir/v2/0203',
							code: 'MR',
						},
					],
				},
				system: 'urn:oid:1.2.36.146.595.217.0.1',
				value: '12345',
				period: {
					start: '2001-05-06',
				},
				assigner: {
					display: 'Acme Healthcare',
				},
			},
		],
		active: true,
		gender: 'male',
		birthDate: '1974-12-25',
		deceasedBoolean: false,
		managingOrganization: {
			reference: 'Organization/1',
		},
	};

	const documentResponse = {
		record_id: 'fakeRecordId',
		date: '2017-08-01',
		user_id: 'fakeUserIId',
		encrypted_body: 'fakeEncryptedBody',
		encrypted_tags: [
			'uzydrHX/3gGWZdZ69LizEA==',
			'+AJ9MhikiHxSX8sD3qdurw==',
		],
		version: 1,
		status: 'Active',
		createdAt: '2017-09-01T13:51:53.741',
	};
	const incorrectFhirSchema = {
		resourceType: 'Patient',
	};
	let fhirValidatorStub;
	let fhirRouteStub;
	let getConformanceStub;
	beforeEach(() => {
		fhirValidatorStub = sinon.stub(FhirValidator, 'validate').returnsPromise()
			.resolves(true);

		fhirService = new FhirService('dummyZerokitadapter');
		fhirService.zeroKitAdapter = {
			decrypt: sinon.stub().returnsPromise().resolves('decryptedData'),
			encrypt: sinon.stub().returnsPromise().resolves('encrypteddocument'),
		};


		userServiceResolveUserStub = sinon.stub(UserService, 'resolveUser').returnsPromise()
			.resolves({
				id: '5fe7a5bb-d366-41ad-a3a5-5a9405b0bf53',
				zerokit_id: '20170906023153.xxut8mkm@xfjx51bvoe.tresorit.io',
				email: 'mmm',
				tresor_id: '0000hi1bxswvamnc1luphqdr',
				user_data: {
					auto_validate: true,
				},
				state: 2,
				tag_encryption_key: 'fakeTagEncKey',
			});
		resolveUserIdStub = sinon.stub(UserService, 'getUserId').returns('fakeUserId');

		fhirService.zeroKitAdapter.decrypt.returnsPromise()
			.withArgs('fakeEncryptedBody').resolves(JSON.stringify(fhirObject));

		fhirService.zeroKitAdapter.decrypt.returnsPromise()
			.withArgs('fakeTagEncKey').resolves('key');
	});

	it('createFhirRecord succeeds', (done) => {
		fhirValidatorStub.withArgs(fhirObject).resolves(false);
		fhirRouteStub = sinon.stub(fhirRoutes, 'getFhirSchema')
			.returnsPromise().resolves(JSON.stringify('dummySchema'));

		const createFhirStub = sinon.stub(documentRoutes, 'createRecord')
			.returnsPromise().resolves(documentResponse);

		fhirService.createFhirRecord(fhirObject, ['tag1', 'tag2']).then((res) => {
			expect(res).to.equal(documentResponse);
			expect(createFhirStub).to.be.calledOnce;
			expect(fhirValidatorStub).to.be.calledOnce;
			expect(resolveUserIdStub).to.be.calledOnce;
			expect(createFhirStub).to.be.calledWith('fakeUserId');
			expect(userServiceResolveUserStub).to.be.calledOnce;
			resolveUserIdStub.restore();
			createFhirStub.restore();
			fhirValidatorStub.restore();
			done();
		});
	});

	it('uploadFhirRecord fails if fhir schema is incorrect', (done) => {
		fhirValidatorStub.withArgs(incorrectFhirSchema).rejects({ error: 'error' });

		const uploadFhirStub = sinon.stub(documentRoutes, 'createRecord')
			.returnsPromise().resolves(documentResponse);

		fhirService.uploadFhirRecord(incorrectFhirSchema, ['tag1', 'tag2']).catch((err) => {
			expect(err).to.deep.equal({ error: 'error' });
			expect(fhirValidatorStub).to.be.calledOnce;
			expect(uploadFhirStub).to.not.be.called;
			done();
		});
	});

	it('updateFhirRecord succeeds', (done) => {
		const updateFhirStub = sinon.stub(documentRoutes, 'updateRecord')
			.returnsPromise().resolves(documentResponse);

		fhirService.updateFhirRecord('fakeRecordId', fhirObject, ['tag1', 'tag2']).then((res) => {
			expect(res).to.equal(documentResponse);
			expect(updateFhirStub).to.be.calledOnce;
			expect(resolveUserIdStub).to.be.calledOnce;
			expect(updateFhirStub).to.be.calledWith('fakeUserId');
			expect(userServiceResolveUserStub).to.be.calledOnce;
			resolveUserIdStub.restore();
			done();
		});
	});

	it('downloadFhirRecord succeeds', (done) => {
		const downloadFhirStub = sinon.stub(documentRoutes, 'downloadRecord')
			.returnsPromise().resolves(documentResponse);

		fhirService.downloadFhirRecord('fakeRecordId').then((res) => {
			expect(res.body).to.deep.equal(fhirObject);
			expect(downloadFhirStub).to.be.calledOnce;
			expect(downloadFhirStub).to.be.calledWith('fakeUserId');
			expect(userServiceResolveUserStub).to.be.calledOnce;
			done();
		});
	});

	it('searchRecords succeeds', (done) => {
		const documentResponseList = [documentResponse];
		const searchRecordsStub = sinon.stub(documentRoutes, 'searchRecords')
			.returnsPromise().resolves(documentResponseList);


		const params = {
			user_ids: ['user1', 'user2'],
			limit: 20,
			offset: 20,
			start_date: '2017-06-06',
			end_date: '2017-08-08',
			tags: ['tag1', 'tag2'],
		};

		const encryptionUtilsStub = sinon.stub(encryptionUtils, 'encrypt');
		encryptionUtilsStub.withArgs('tag1', 'key').returns('enTag1');
		encryptionUtilsStub.withArgs('tag2', 'key').returns('enTag2');

		const expectedParamsForRoute = {
			user_ids: 'user1,user2',
			limit: 20,
			offset: 20,
			start_date: '2017-06-06',
			end_date: '2017-08-08',
			tags: 'enTag1,enTag2',
		};

		fhirService.searchRecords(params).then((res) => {
			expect(res).to.deep.equal(documentResponseList);
			expect(searchRecordsStub).to.be.calledOnce;
			expect(searchRecordsStub).to.be.calledWith(expectedParamsForRoute);
			expect(userServiceResolveUserStub).to.be.calledOnce;
			done();
		});
	});

	it('deleteRecord succeeds when userId is passed', (done) => {
		const uploadFhirStub = sinon.stub(documentRoutes, 'deleteRecord')
			.returnsPromise().resolves();

		fhirService.deleteRecord('fakeRecordId', 'fakeUserId2').then(() => {
			expect(uploadFhirStub).to.be.calledOnce;
			expect(uploadFhirStub).to.be.calledWith('fakeUserId2', 'fakeRecordId');
			uploadFhirStub.restore();
			done();
		});
	});

	it('deleteRecord succeeds when userId is not passed', (done) => {
		const uploadFhirStub = sinon.stub(documentRoutes, 'deleteRecord')
			.returnsPromise().resolves();

		fhirService.deleteRecord('fakeRecordId').then(() => {
			expect(uploadFhirStub).to.be.calledOnce;
			expect(uploadFhirStub).to.be.calledWith('fakeUserId', 'fakeRecordId');
			uploadFhirStub.restore();
			done();
		});
	});

	afterEach(() => {
		userServiceResolveUserStub.restore();
		resolveUserIdStub.restore();
		fhirValidatorStub.restore();
	});
});
