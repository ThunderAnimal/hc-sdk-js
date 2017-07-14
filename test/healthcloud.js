/* eslint-env mocha */
const hcSdk = require(`${__dirname}/../dest/healthcloud_sdk`);
const chai = require('chai');

const assert = chai.assert;

describe('HealthCloud', () => {
	it('sdk exists', () => {
		assert.equal(typeof hcSdk, 'function');
	});
});
