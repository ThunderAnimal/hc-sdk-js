/* eslint-env mocha */
const HealthCloud = require('../src/healthcloud');
const chai = require('chai');
const sinon = require('sinon');

const assert = chai.assert;

describe('HealthCloud', () => {
	let hcx;
	it('printHelloWorld can be called', () => {
		hcx = new HealthCloud();
		let requestSpy = sinon.spy(hcx, 'request');
		hcx.printHelloWorld();
		assert(requestSpy.calledOnce);
	});
});
