/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Tags from '../../src/lib/Tags';

chai.use(sinonChai);

const expect = chai.expect;

describe('tags', () => {
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

	it('createTagsFromFHIR succeeds', (done) => {
		const tags = new Tags().createTagsFromFHIR(fhirObject);
		expect(tags.length).to.equal(2);
		expect(tags.includes(fhirObject.resourceType)).to.be.true;
		expect(tags.includes(fhirObject.managingOrganization.reference)).to.be.true;
		done();
	});
});
