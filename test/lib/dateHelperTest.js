/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import dateHelper from '../../src/lib/dateHelper';

chai.use(sinonChai);

const expect = chai.expect;

describe('date helper', () => {
	it('converts date to yyyy-mm-dd format', (done) => {
		const date = new Date('2017-04-11');
		const formattedDate = dateHelper.formatDateYyyyMmDd(date);
		expect(formattedDate).to.equal('2017-04-11');
		done();
	});
});
