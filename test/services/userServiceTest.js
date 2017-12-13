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
import { NOT_LOGGED_IN } from '../../src/lib/errors/LoginError';
import { MISSING_PARAMETERS, INVALID_PARAMETERS } from '../../src/lib/errors/ValidationError';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('services/UserService', () => {
	let sessionHandlerGetStub;
	let sessionHandlerSetStub;
	let zkitAdapterEncryptStub;
	let zkitAdapterDecryptStub;

	beforeEach(() => {
		sessionHandlerGetStub =
			sinon.stub(sessionHandler, 'get').returns('fakeUserId,fakeUserAlias');
		sessionHandlerSetStub =
			sinon.stub(sessionHandler, 'set').returns('fakeUserId,fakeUserAlias');
		zkitAdapterEncryptStub =
			sinon.stub().returnsPromise().resolves('encryptedData');
		zkitAdapterDecryptStub =
			sinon.stub().returnsPromise().resolves('decryptedData');

		User.zeroKitAdapter = {
			decrypt: zkitAdapterDecryptStub,
			encrypt: zkitAdapterEncryptStub,
		};
	});

	it('getUserId succeeds', (done) => {
		const userId = User.getUserId();
		expect(userId).to.equal('fakeUserId');
		expect(sessionHandlerGetStub).to.be.calledOnce;
		expect(sessionHandlerSetStub).to.not.be.called;
		done();
	});

	it('getUserAlias succeeds', (done) => {
		const userAlias = User.getUserAlias();
		expect(userAlias).to.equal('fakeUserAlias');
		expect(sessionHandlerGetStub).to.be.calledOnce;
		expect(sessionHandlerSetStub).to.not.be.called;
		done();
	});

	it('getUserIdAndAlias succeeds', (done) => {
		const user = User.getUserIdAndAlias();
		expect(user.user_alias).to.equal('fakeUserAlias');
		expect(user.user_id).to.equal('fakeUserId');
		expect(sessionHandlerGetStub).to.be.calledTwice;
		expect(sessionHandlerSetStub).to.not.be.called;
		done();
	});

	it('getUserIdAndAlias fails if user not logged in', (done) => {
		sessionHandlerGetStub.returns(null);
		const user = User.getUserIdAndAlias();
		expect(user).to.equal(undefined);
		expect(sessionHandlerGetStub).to.be.calledOnce;
		done();
	});

	it('getUser succeeds when capella succeeds', (done) => {
		User.user = undefined;
		const user = {
			user: {
				id: '93725dda-13e0-4105-bffb-fdcfd73d1db5',
				zerokit_id: '20171009091448.uln45hn4@g6y0wg1tf6.tresorit.io',
				email: 'katappa',
				tresor_id: '0000yd5mfs53mvftfh16a5va',
				user_data: {},
				state: 2,
				reg_data: {
					session_id: '',
					SessionVerifier: '',
					ValidationVerifier: '',
					ValidationCode: '',
				},
				tag_encryption_key: '/7LjA2xCi3ySsUQR8ovuiVGtF3I5kMgd0ar/9+==',
			},
		};
		const userServiceUserStub =
			sinon.stub(userRoutes, 'getUserDetails')
				.returnsPromise().resolves(user);

		User.getUser().then((res) => {
			expect(res.tag_encryption_key).to.equal(undefined);
			expect(res.zerokit_id).to.equal(undefined);
			expect(res.tresor_id).to.equal(undefined);
			expect(res.state).to.equal(2);
			expect(res.user_date).to.deep.equal(user.user_data);
			expect(userServiceUserStub).to.be.calledOnce;
			expect(zkitAdapterDecryptStub).to.be.calledOnce;
			userRoutes.getUserDetails.restore();
			done();
		});
	});

	it('getUser fails when capella returns error', (done) => {
		User.user = undefined;
		const userServiceResolveUserStub =
			sinon.stub(userRoutes, 'getUserDetails')
				.returnsPromise().rejects({ error: 'error completing request' });
		User.getUser().catch((res) => {
			expect(res.error).to.equal('error completing request');
			expect(userServiceResolveUserStub).to.be.calledOnce;
			userRoutes.getUserDetails.restore();
			done();
		});
	});

	it('getGrantedPermissions succeeds when altair succeeds', (done) => {
		const userServiceGrantedPermissionsStub =
			sinon.stub(userRoutes, 'getGrantedPermissions')
				.returnsPromise().resolves([{ owner_id: 'a', grantee_id: 'b' }]);
		User.getGrantedPermissions().then((res) => {
			userRoutes.getGrantedPermissions.restore();
			expect(res).to.deep.equal([{ grantee_id: 'b' }]);
			expect(userServiceGrantedPermissionsStub).to.be.calledOnce;
			done();
		});
	});

	it('getGrantedPermissions fails when user not logged in', (done) => {
		const userServiceGrantedPermissionsStub =
			sinon.stub(userRoutes, 'getGrantedPermissions')
				.returnsPromise().resolves({});
		User.user = undefined;
		sessionHandlerGetStub.returns(null);
		User.getGrantedPermissions().catch((res) => {
			userRoutes.getGrantedPermissions.restore();
			expect(res.message).to.equal(NOT_LOGGED_IN);
			expect(userServiceGrantedPermissionsStub).to.not.be.called;
			done();
		});
	});

	it('getGrantedPermissions fails when altair returns error', (done) => {
		const userServiceGrantedPermissionStub =
			sinon.stub(userRoutes, 'getGrantedPermissions')
				.returnsPromise().rejects({ error: 'error completing request' });
		User.user = undefined;
		User.getGrantedPermissions().catch((res) => {
			userRoutes.getGrantedPermissions.restore();
			expect(res.error).to.equal('error completing request');
			expect(userServiceGrantedPermissionStub).to.be.calledOnce;
			done();
		});
	});

	it('resolveUser succeeds when capella succeeds', (done) => {
		const userServiceUserStub =
			sinon.stub(userRoutes, 'getUserDetails')
				.returnsPromise().resolves({ user: 'user' });
		User.resolveUser().then((res) => {
			expect(res).to.equal('user');
			expect(userServiceUserStub).to.be.calledOnce;
			userRoutes.getUserDetails.restore();
			done();
		});
	});

	it('resolveUser fails when user not logged in', (done) => {
		const userServiceResolveUserStub =
			sinon.stub(userRoutes, 'getUserDetails')
				.returnsPromise().resolves({ user: 'user' });
		User.user = undefined;
		sessionHandlerGetStub.returns(null);
		User.resolveUser().catch((res) => {
			expect(res.message).to.equal(NOT_LOGGED_IN);
			expect(userServiceResolveUserStub).to.not.be.called;
			userRoutes.getUserDetails.restore();
			done();
		});
	});

	it('resolveUser fails when capella returns error', (done) => {
		const userServiceResolveUserStub =
			sinon.stub(userRoutes, 'getUserDetails')
				.returnsPromise().rejects({ error: 'error completing request' });
		User.user = undefined;
		User.resolveUser().catch((res) => {
			expect(res.error).to.equal('error completing request');
			expect(userServiceResolveUserStub).to.be.calledOnce;
			userRoutes.getUserDetails.restore();
			done();
		});
	});

	it('resolveUserByAlias succeeds', (done) => {
		const userServiceUserStub =
			sinon.stub(userRoutes, 'resolveUserId')
				.returnsPromise().resolves({ uid: 'id', zerokit_id: 'zerokit_id' });
		User.resolveUserByAlias('alias').then((res) => {
			expect(res).to.deep.equal({ id: 'id', zeroKitId: 'zerokit_id' });
			expect(userServiceUserStub).to.be.calledOnce;
			userRoutes.resolveUserId.restore();
			done();
		});
	});

	it('resolveUserByAlias failes', (done) => {
		const userServiceResolveUserStub =
			sinon.stub(userRoutes, 'resolveUserId')
				.returnsPromise().rejects({ error: 'error completing request' });
		User.user = undefined;
		User.resolveUserByAlias('alias').catch((res) => {
			expect(res.error).to.equal('error completing request');
			expect(userServiceResolveUserStub).to.be.calledOnce;
			userRoutes.resolveUserId.restore();
			done();
		});
	});

	it('updateUser succeeds when capella succeeds', (done) => {
		const user = {
			id: '93725dda-13e0-4105-bffb-fdcfd73d1db5',
			user_data: {},
		};
		const getUserStub =
			sinon.stub(User, 'getUser')
				.returnsPromise().resolves(user);
		const userServiceUserStub =
			sinon.stub(userRoutes, 'updateUser')
				.returnsPromise().resolves({});
		User.updateUser({ name: 'fakeName' }).then(() => {
			expect(userServiceUserStub).to.be.calledOnce;
			expect(getUserStub).to.be.calledOnce;
			expect(zkitAdapterEncryptStub).to.be.calledOnce;
			userRoutes.updateUser.restore();
			User.getUser.restore();
			done();
		});
	});

	it('updateUser fails when no user is logged in', (done) => {
		sessionHandler.get.restore();
		sessionHandlerGetStub =
			sinon.stub(sessionHandler, 'get').returns(null);
		User.updateUser({ name: 'fakeName' }).catch((res) => {
			expect(res.message).to.equal(NOT_LOGGED_IN);
			done();
		});
	});

	it('updateUser fails when capella returns error', (done) => {
		const user = {
			id: '93725dda-13e0-4105-bffb-fdcfd73d1db5',
			user_data: {},
		};
		const getUserStub =
			sinon.stub(User, 'getUser')
				.returnsPromise().resolves(user);
		const userServiceUserStub =
			sinon.stub(userRoutes, 'updateUser')
				.returnsPromise().rejects({ error: 'error completing request' });
		User.updateUser({ name: 'fakeName' }).catch((res) => {
			expect(res.error).to.equal('error completing request');
			expect(userServiceUserStub).to.be.calledOnce;
			expect(getUserStub).to.be.calledOnce;
			userRoutes.updateUser.restore();
			User.getUser.restore();
			done();
		});
	});

	it('updateUser fails when no parameters are passed', (done) => {
		User.updateUser().catch((res) => {
			expect(res.message).to.equal(MISSING_PARAMETERS);
			done();
		});
	});

	it('updateUser fails when parameters is not an object', (done) => {
		User.updateUser('string').catch((res) => {
			expect(res.message).to.equal(`${INVALID_PARAMETERS}: parameter is not an object`);
			done();
		});
	});

	it('updateUser fails when parameters is an empty object', (done) => {
		User.updateUser({}).catch((res) => {
			expect(res.message).to.equal(`${INVALID_PARAMETERS}: object is empty`);
			done();
		});
	});

	afterEach(() => {
		sessionHandler.get.restore();
		sessionHandler.set.restore();
		sessionHandlerGetStub.reset();
		sessionHandlerSetStub.reset();
		zkitAdapterEncryptStub.reset();
		zkitAdapterDecryptStub.reset();
	});
});
