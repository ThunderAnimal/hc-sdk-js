/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import taggingUtils, { tagKeys } from '../../src/lib/taggingUtils';
import testVariables from '../../test/testUtils/testVariables';

chai.use(sinonChai);

const expect = chai.expect;

describe('taggingUtils', () => {
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

    it('generateTagsFromFhirObject succeeds', (done) => {
        const generatedTags = taggingUtils.generateTagsFromFhirObject(fhirObject);
        expect(generatedTags.length).to.equal(1);
        expect(generatedTags[0]).to.equal('resourcetype=patient');
        done();
    });

    it('buildTag returns correctly encoded tag', (done) => {
        const tag = taggingUtils.buildTag(
            ';,/?:@&=+$#-_.!~*\'()ABC abc 123',
            ';,/?:@&=+$#-_.!~*\'()ABC abc 123');
        expect(tag).to.equal(
            '%3B%2C%2F%3F%3A%40%26%3D%2B%24%23%2d%5f%2e%21%7e%2a%27%28%29abc%20abc%20123='
            + '%3B%2C%2F%3F%3A%40%26%3D%2B%24%23%2d%5f%2e%21%7e%2a%27%28%29abc%20abc%20123');
        done();
    });

    it('returns correct tag value when getValue is called with tag', () => {
        const tagValue = taggingUtils.getValue(testVariables.secondTag);
        expect(tagValue).to.equal('1');
    });

    it('returns undefined when getValue is called with incorrect tag format', () => {
        const tagValue = taggingUtils.getValue('client%2');
        expect(tagValue).to.equal(undefined);
    });

    it('returns correct tag value when getTagValueFromList is called with list and tag', () => {
        const tagValue = taggingUtils.getTagValueFromList(
            [testVariables.tag, testVariables.secondTag], tagKeys.client,
        );
        expect(tagValue).to.equal('1');
    });
});
