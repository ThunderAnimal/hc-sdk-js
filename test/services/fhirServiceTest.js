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


	beforeEach(() => {
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

	it('uploadFhirRecord succeeds', (done) => {
		const uploadFhirStub = sinon.stub(documentRoutes, 'uploadRecord')
			.returnsPromise().resolves(documentResponse);

		fhirService.uploadFhirRecord(fhirObject, ['tag1', 'tag2']).then((res) => {
			expect(res).to.equal(documentResponse);
			expect(uploadFhirStub).to.be.calledOnce;
			expect(resolveUserIdStub).to.be.calledOnce;
			expect(uploadFhirStub).to.be.calledWith('fakeUserId');
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

	afterEach(() => {
		userServiceResolveUserStub.restore();
		resolveUserIdStub.restore();
	});
});
