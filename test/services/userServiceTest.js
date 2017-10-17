/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import User from '../../src/services/UserService';
import sessionHandler from '../../src/lib/sessionHandler';
import userRoutes from '../../src/routes/userRoutes';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('services/User', () => {
	let sessionHandlerGetStub;
	let sessionHandlerSetStub;

	beforeEach(() => {
		sessionHandlerGetStub =
			sinon.stub(sessionHandler, 'get').returns('fakeUserId,fakeUserName');
		sessionHandlerSetStub =
			sinon.stub(sessionHandler, 'set').returns('fakeUserId,fakeUserName');
	});

	it('getUserId succeeds', (done) => {
		const userId = User.getUserId();
		expect(userId).to.equal('fakeUserId');
		expect(sessionHandlerGetStub).to.be.calledOnce;
		expect(sessionHandlerSetStub).to.not.be.called;
		done();
	});

	it('getUserName succeeds', (done) => {
		const userName = User.getUserName();
		expect(userName).to.equal('fakeUserName');
		expect(sessionHandlerGetStub).to.be.calledOnce;
		expect(sessionHandlerSetStub).to.not.be.called;
		done();
	});

	it('getUser succeeds', (done) => {
		const user = User.getUser();
		expect(user.user_name).to.equal('fakeUserName');
		expect(user.user_id).to.equal('fakeUserId');
		expect(sessionHandlerGetStub).to.be.calledTwice;
		expect(sessionHandlerSetStub).to.not.be.called;
		done();
	});

	it('getUser fails if user not logged in', (done) => {
		sessionHandlerGetStub.returns(null);
		const user = User.getUser();
		expect(user).to.equal(undefined);
		expect(sessionHandlerGetStub).to.be.calledOnce;
		done();
	});

	it('resolveUser succeeds when capella succeeds', (done) => {
		const userServiceUserStub =
			sinon.stub(userRoutes, 'resolveUserId')
				.returnsPromise().resolves({ user: 'user' });
		User.resolveUser().then((res) => {
			expect(res).to.equal('user');
			expect(userServiceUserStub).to.be.calledOnce;
			userRoutes.resolveUserId.restore();
			done();
		});
	});

	it('resolveUser fails when capella returns error', (done) => {
		const userServiceResolveUserStub =
			sinon.stub(userRoutes, 'resolveUserId')
				.returnsPromise().rejects({ error: 'error completing request' });
		User.user = undefined;
		User.resolveUser().catch((res) => {
			expect(res.error).to.equal('error completing request');
			expect(userServiceResolveUserStub).to.be.calledOnce;
			userRoutes.resolveUserId.restore();
			done();
		});
	});


	afterEach(() => {
		sessionHandler.get.restore();
		sessionHandler.set.restore();
		sessionHandlerGetStub.reset();
		sessionHandlerSetStub.reset();
	});
});
