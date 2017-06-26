/* eslint-env mocha */
const hc_sdk = require(`${__dirname}/../dest/healthcloud_sdk`);
const chai = require('chai');
const sinon = require('sinon');

const assert = chai.assert;

describe('HealthCloud', () => {
	let HC;
	it('sdk exists', () => {
		assert(typeof hc_sdk === 'object');
	});
});
