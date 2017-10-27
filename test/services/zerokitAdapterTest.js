/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import UserService from '../../src/services/UserService';
import userRoutes from '../../src/routes/userRoutes';
import ZerokitAdapter from '../../src/services/ZeroKitAdapter';
import loginForm from '../../src/templates/loginForm';
import registrationForm from '../../src/templates/registrationForm';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('zerokitAdapter', () => {
	let zerokitAdapter;
	let userRouteAddTresorStub;
	let userRoutesResolveUserIdStub;
	let zKitLoginObject;
	let zKitLoginObjectPromise;
	let zKitRegisterObject;
	let zKitRegisterObjectPromise;
	let zkit_sdk;

	beforeEach(() => {
		zKitLoginObject = { login: sinon.stub().returnsPromise().resolves('fakeZkitId') };
		zKitLoginObjectPromise = Promise.resolve(zKitLoginObject);
		zKitRegisterObject = {
			register: sinon.stub().returnsPromise().resolves({
				RegValidationVerifier: '4003a02ffcd1111248df4136d32d533b',
				MasterFragmentVersion: 1,
			}),
		};
		zKitRegisterObjectPromise = Promise.resolve(zKitRegisterObject);

		zkit_sdk = {
			getLoginIframe: sinon.stub().returns(zKitLoginObject),
			getRegistrationIframe: sinon.stub().returns(zKitLoginObject),
			createTresor: sinon.stub().returnsPromise().resolves('fakeTresorId'),
			setup: sinon.stub(),
			encrypt: sinon.stub().returnsPromise().resolves('encryptedDoc'),
			decrypt: sinon.stub().returnsPromise().resolves('decryptedDoc'),
		};

		window.document.getElementsByTagName = sinon.stub().returns([{ appendChild: sinon.spy() }]);
		window.document.getElementById = sinon.stub().returns({});

		zerokitAdapter = new ZerokitAdapter('dummyZerokitadapter');

		zerokitAdapter.auth = { idpLogin: sinon.stub().returnsPromise().resolves('') };
		zerokitAdapter.zeroKitAdapter = {
			decrypt: sinon.stub().returnsPromise().resolves('decryptedDocument'),
			encrypt: sinon.stub().returnsPromise().resolves('encrypteddocument'),
		};
		zerokitAdapter.zeroKit = Promise.resolve(zkit_sdk);
		userRouteAddTresorStub =
			sinon.stub(userRoutes, 'addTresor')
				.returnsPromise().resolves();
	});

	it('login succeeds', (done) => {
		userRoutesResolveUserIdStub =
			sinon.stub(userRoutes, 'resolveUserId')
				.returnsPromise().resolves({
					user: {
						id: 'kjhgf',
						zerokit_id: 'fakeZkitId',
						tresor_id: 'fakeTresorId',
					},
				});

		zerokitAdapter.login(zKitLoginObjectPromise, 'dummyUserAlias', (err, res) => {
			expect(res.user_alias).to.equal('dummyUserAlias');
			expect(err).to.equal(null);
			expect(userRoutesResolveUserIdStub).to.be.calledOnce;
			expect(zKitLoginObject.login).to.be.calledOnce;
			userRoutes.resolveUserId.restore();

			done();
		});
	});

	it('callback returns error if idpLogin fails', (done) => {
		userRoutesResolveUserIdStub =
			sinon.stub(userRoutes, 'resolveUserId')
				.returnsPromise().resolves({
					user: {
						id: 'kjhgf',
						zerokit_id: 'fakeZkitId',
						tresor_id: 'fakeTresorId',
					},
				});
		zerokitAdapter.auth = { idpLogin: sinon.stub().returnsPromise().rejects('error') };

		zerokitAdapter.login(zKitLoginObjectPromise, 'dummyUserAlias', (err) => {
			expect(err).to.equal('error');
			expect(userRoutesResolveUserIdStub).to.be.calledOnce;
			expect(zKitLoginObject.login).to.be.calledOnce;
			userRoutes.resolveUserId.restore();

			done();
		});
	});

	it('callback returns error if user route fails to resolve user ', (done) => {
		userRoutesResolveUserIdStub =
			sinon.stub(userRoutes, 'resolveUserId')
				.returnsPromise().rejects('error');
		zerokitAdapter.auth = { idpLogin: sinon.stub().yields('error') };

		zerokitAdapter.login(zKitLoginObjectPromise, 'dummyUserAlias', (err) => {
			expect(err).to.equal('error');
			expect(userRoutesResolveUserIdStub).to.be.calledOnce;
			userRoutes.resolveUserId.restore();
			done();
		});
	});

	it('tresor is created after login if user doesn\'t have one already', (done) => {
		userRoutesResolveUserIdStub =
			sinon.stub(userRoutes, 'resolveUserId')
				.returnsPromise().resolves({
					user: { id: 'kjhgf', zerokit_id: 'fakeZkitId' },
				});

		zerokitAdapter.login(zKitLoginObjectPromise, 'dummyUserAlias', (err, res) => {
			expect(res.user_alias).to.equal('dummyUserAlias');
			expect(err).to.equal(null);
			expect(userRoutesResolveUserIdStub).to.be.calledOnce;
			expect(userRouteAddTresorStub).to.be.calledOnce;
			expect(zKitLoginObject.login).to.be.calledOnce;
			expect(zkit_sdk.createTresor).to.be.calledOnce;
			userRoutes.resolveUserId.restore();
			done();
		});
	});

	it('register succeeds', (done) => {
		const userRoutesInitRegisterStub =
			sinon.stub(userRoutes, 'initRegistration')
				.returnsPromise().resolves({
					session_id: 'fakeSessionId', zerokit_id: 'fakeZerokitId',
				});
		const userRoutesvalidateRegistrationStub =
			sinon.stub(userRoutes, 'validateRegistration')
				.returnsPromise().resolves();

		zerokitAdapter.register(zKitRegisterObjectPromise, 'dummyUserAlias', (err, res) => {
			expect(res.user_alias).to.equal('dummyUserAlias');
			expect(err).to.equal(null);
			expect(userRoutesInitRegisterStub).to.be.calledOnce;
			expect(userRoutesvalidateRegistrationStub).to.be.calledOnce;
			expect(zKitRegisterObject.register).to.be.calledOnce;
			userRoutes.initRegistration.restore();
			userRoutes.validateRegistration.restore();
			done();
		});
	});

	it('register callback returns error if user fails to initiate registration', (done) => {
		const userRoutesInitRegisterStub =
			sinon.stub(userRoutes, 'initRegistration')
				.returnsPromise().rejects('error');
		const userRoutesvalidateRegistrationStub =
			sinon.stub(userRoutes, 'validateRegistration')
				.returnsPromise().resolves();

		zerokitAdapter.register(zKitRegisterObjectPromise, 'dummyUserAlias', (err) => {
			expect(err).to.equal('error');
			expect(userRoutesInitRegisterStub).to.be.calledOnce;
			expect(userRoutesvalidateRegistrationStub).to.not.be.called;
			expect(zKitRegisterObject.register).to.not.be.called;
			done();
		});
	});

	it('encrypt succeeds', (done) => {
		userRoutesResolveUserIdStub =
			sinon.stub(userRoutes, 'resolveUserId')
				.returnsPromise().resolves({
					user: { id: 'kjhgf', zerokit_id: 'fakeZkitId' },
				});

		const getUserIdStub = sinon.stub(UserService, 'getUserId').returns('fakeUserId');
		const getUserAliasStub = sinon.stub(UserService, 'getUserAlias').returns('fakeUserAlias');
		zerokitAdapter.encrypt('doc').then((res) => {
			expect(res).to.equal('encryptedDoc');
			expect(getUserIdStub).to.be.calledOnce;
			expect(getUserAliasStub).to.be.calledOnce;
			userRoutes.resolveUserId.restore();
			UserService.getUserAlias.restore();
			UserService.getUserId.restore();
			done();
		});
	});

	it('createTresor is not called if user already has tresor', (done) => {
		userRoutesResolveUserIdStub =
			sinon.stub(userRoutes, 'resolveUserId')
				.returnsPromise().resolves({
					user: {
						id: 'kjhgf',
						zerokit_id: 'fakeZkitId',
						tresor_id: 'fakeTresorId',
					},
				});
		UserService.user = undefined;
		const getUserIdStub = sinon.stub(UserService, 'getUserId').returns('fakeUserId');
		const getUserAliasStub = sinon.stub(UserService, 'getUserAlias').returns('fakeUserAlias');
		zerokitAdapter.encrypt('doc').then((res) => {
			expect(res).to.equal('encryptedDoc');
			expect(getUserIdStub).to.not.be.called;
			expect(getUserAliasStub).to.be.calledOnce;
			userRoutes.resolveUserId.restore();
			done();
		});
	});

	it('decrypt succeeds', (done) => {
		zerokitAdapter.decrypt('doc').then((res) => {
			expect(res).to.equal('decryptedDoc');
			expect(zkit_sdk.decrypt).to.be.calledOnce;
			done();
		});
	});

	it('getLoginForm succeeds', (done) => {
		const loginStub = sinon.stub(zerokitAdapter, 'login').yields(null, { user: 'userName' });
		const parentElement = { appendChild: sinon.stub() };
		zerokitAdapter.getLoginForm(parentElement, () => {
			expect(loginStub).to.be.calledOnce;
			done();
		});
		loginForm.onsubmit({ preventDefault: sinon.spy() });
	});

	it('getLoginForm succeeds when zkit_sdk is undefined', (done) => {
		window.zkit_sdk = undefined;
		const loginStub =
			sinon.stub(zerokitAdapter, 'login')
				.yields(null, { user_alias: 'userName' });
		const parentElement = { appendChild: sinon.stub() };
		zerokitAdapter.getLoginForm(parentElement, () => {
			expect(loginStub).to.be.calledOnce;
			done();
		});
		window.zkit_sdk = {
			getLoginIframe: sinon.stub().returns(zKitLoginObject),
			getRegistrationIframe: sinon.stub().returns(zKitLoginObject),
			createTresor: sinon.stub().returnsPromise().resolves('fakeTresorId'),
			setup: sinon.stub(),
			encrypt: sinon.stub().returnsPromise().resolves('encryptedDoc'),
			decrypt: sinon.stub().returnsPromise().resolves('decryptedDoc'),

		};
		loginForm.onsubmit({ preventDefault: sinon.spy() });
	});

	it('getRegisterForm succeeds', (done) => {
		const registerStub =
			sinon.stub(zerokitAdapter, 'register')
				.yields(null, { user_alias: 'userName' });
		const parentElement = { appendChild: sinon.stub() };
		zerokitAdapter.getRegistrationForm(parentElement, () => {
			expect(registerStub).to.be.calledOnce;
			done();
		});
		registrationForm.onsubmit({ preventDefault: sinon.spy() });
	});

	it('getRegisterForm succeeds when zkit_sdk is undefined', (done) => {
		window.zkit_sdk = undefined;
		const registerStub =
			sinon.stub(zerokitAdapter, 'register')
				.yields(null, { user_alias: 'userName' });
		const parentElement = { appendChild: sinon.stub() };
		zerokitAdapter.getRegistrationForm(parentElement, () => {
			expect(registerStub).to.be.calledOnce;
			done();
		});
		window.zkit_sdk = {
			getLoginIframe: sinon.stub().returns(zKitLoginObject),
			getRegistrationIframe: sinon.stub().returns(zKitLoginObject),
			createTresor: sinon.stub().returnsPromise().resolves('fakeTresorId'),
			setup: sinon.stub(),
			encrypt: sinon.stub().returnsPromise().resolves('encryptedDoc'),
			decrypt: sinon.stub().returnsPromise().resolves('decryptedDoc'),

		};
		registrationForm.onsubmit({ preventDefault: sinon.spy() });
	});

	afterEach(() => {
		userRoutes.addTresor.restore();
	});
});
