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
import sessionHandler from '../../src/lib/sessionHandler';
import testVariables from '../testUtils/testVariables';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('zerokitAdapter', () => {
	let zerokitAdapter;
	let userRouteAddTresorStub;
	let userRoutesResolveUserIdStub;
	let addTagEncryptionKeyStub;
	let zKitLoginObject;
	let zKitLoginObjectPromise;
	let zKitRegisterObject;
	let zKitRegisterObjectPromise;
	let zkit_sdk;
	let userRouteVerifyShareAndGrantPermissionStub;
	let getUserStub;
	let getCurrentUserStub;
	let resolveUserStub;
	let resolveUserByAliasStub;

	beforeEach(() => {
		getCurrentUserStub = sinon.stub(UserService, 'getCurrentUser')
			.returns({ id: testVariables.userId, alias: testVariables.userAlias });
		zKitLoginObject = { login: sinon.stub().returnsPromise().resolves('fakeZkitId') };
		zKitLoginObjectPromise = Promise.resolve(zKitLoginObject);
		zKitRegisterObject = {
			register: sinon.stub().returnsPromise().resolves({
				RegValidationVerifier: '4003a02ffcd1111248df4136d32d533b',
				MasterFragmentVersion: 1,
			}),
		};
		addTagEncryptionKeyStub =
			sinon.stub(userRoutes, 'addTagEncryptionKey')
				.returnsPromise().resolves({});
		zKitRegisterObjectPromise = Promise.resolve(zKitRegisterObject);

		zkit_sdk = {
			getLoginIframe: sinon.stub().returns(zKitLoginObject),
			getRegistrationIframe: sinon.stub().returns(zKitLoginObject),
			createTresor: sinon.stub().returnsPromise().resolves('fakeTresorId'),
			setup: sinon.stub(),
			encrypt: sinon.stub().returnsPromise().resolves('encryptedDoc'),
			decrypt: sinon.stub().returnsPromise().resolves('decryptedDoc'),
			logout: sinon.stub().returnsPromise().resolves('success'),
			shareTresor: sinon.stub().returnsPromise().resolves('fakeOperationId'),
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
		userRouteVerifyShareAndGrantPermissionStub =
			sinon.stub(userRoutes, 'verifyShareAndGrantPermission')
				.returnsPromise().resolves();

		resolveUserByAliasStub =
			sinon.stub().returnsPromise().resolves({
				id: 'kjhgf',
				zeroKitId: 'fakeZkitId',
			});
		getUserStub = sinon.stub().returnsPromise().resolves({
			tresor_id: 'fakeTresorId',
		});

		UserService.resolveUser = resolveUserByAliasStub;
		UserService.getInternalUser = getUserStub;
	});

	it('login fails when email is invalid', (done) => {
		zerokitAdapter.login(zKitLoginObjectPromise, 'dummyUser')
			.catch((err) => {
				expect(err.name).to.equal('ValidationError');
				done();
			});
	});

	it('login succeeds', (done) => {
		zerokitAdapter.login(zKitLoginObjectPromise, testVariables.userAlias)
			.then((res) => {
				expect(res.alias).to.equal(testVariables.userAlias);
				expect(addTagEncryptionKeyStub).to.be.calledOnce;
				expect(resolveUserByAliasStub).to.be.calledOnce;
				expect(zKitLoginObject.login).to.be.calledOnce;

				done();
			})
			.catch(console.log);
	});


	it('callback returns error if idpLogin fails', (done) => {
		zerokitAdapter.auth = { idpLogin: sinon.stub().returnsPromise().rejects('error') };

		zerokitAdapter.login(zKitLoginObjectPromise, 'dummyUser@domain.com')
			.catch((err) => {
				expect(err).to.equal('error');
				expect(resolveUserByAliasStub).to.be.calledOnce;
				expect(zKitLoginObject.login).to.be.calledOnce;

				done();
			});
	});

	it('callback returns error if user route fails to resolve user ', (done) => {
		resolveUserByAliasStub.rejects();
		zerokitAdapter.auth = { idpLogin: sinon.stub().yields('error') };

		zerokitAdapter.login(zKitLoginObjectPromise, 'dummyUser@domain.com')
			.catch((err) => {
				expect(resolveUserByAliasStub).to.be.calledOnce;
				done();
			});
	});

	it('tresor is created after login if user doesn\'t have one already', (done) => {
		getUserStub.resolves({ tag_encryption_key: '' });

		zerokitAdapter.login(zKitLoginObjectPromise, testVariables.userAlias)
			.then((res) => {
				expect(res.alias).to.equal(testVariables.userAlias);
				expect(resolveUserByAliasStub).to.be.calledOnce;
				expect(userRouteAddTresorStub).to.be.calledOnce;
				expect(zKitLoginObject.login).to.be.calledOnce;
				expect(zkit_sdk.createTresor).to.be.calledOnce;
				expect(addTagEncryptionKeyStub).to.be.calledOnce;
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

		zerokitAdapter.register(zKitRegisterObjectPromise, testVariables.userAlias)
			.then((res) => {
				expect(res.alias).to.equal(testVariables.userAlias);
				expect(userRoutesInitRegisterStub).to.be.calledOnce;
				expect(userRoutesvalidateRegistrationStub).to.be.calledOnce;
				expect(zKitRegisterObject.register).to.be.calledOnce;
				userRoutes.initRegistration.restore();
				userRoutes.validateRegistration.restore();
				done();
			});
	});

	it('register fails if userAlias is not in correct format', (done) => {
		zerokitAdapter.register(zKitRegisterObjectPromise, testVariables.userAlias.split('@')[0])
			.catch((err) => {
				expect(err.name).to.equal('ValidationError');
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

		zerokitAdapter.register(zKitRegisterObjectPromise, 'dummyUser@domain.com')
			.catch((err) => {
				expect(err).to.equal('error');
				expect(userRoutesInitRegisterStub).to.be.calledOnce;
				expect(userRoutesvalidateRegistrationStub).to.not.be.called;
				expect(zKitRegisterObject.register).to.not.be.called;
				done();
			});
	});

	it('encrypt succeeds', (done) => {
		UserService.user = {
			id: 'kjhgf',
			zerokit_id: 'fakeZkitId',
		};

		zerokitAdapter.encrypt(testVariables.userId, 'doc').then((res) => {
			expect(zkit_sdk.encrypt).to.be.calledOnce;
			expect(res).to.equal('encryptedDoc');
			done();
		});
	});

	it('createTresor is not called if user already has tresor', (done) => {
		UserService.user = {
			id: 'kjhgf',
			zerokit_id: 'fakeZkitId',
			tresor_id: 'fakeTresorId',
		};

		zerokitAdapter.encrypt('doc').then((res) => {
			expect(res).to.equal('encryptedDoc');
			expect(userRouteAddTresorStub).to.not.be.called;
			UserService.user = undefined;
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
		const loginStub = sinon.stub(zerokitAdapter, 'login')
			.returnsPromise().resolves({ user: 'userName' });
		const parentElement = { appendChild: sinon.stub() };

		zerokitAdapter.getLoginForm(parentElement)
			.then(() => {
				expect(loginStub).to.be.calledOnce;
				done();
			});
		loginForm.onsubmit({ preventDefault: sinon.spy() });
	});

	it('getLoginForm succeeds when zkit_sdk is undefined', (done) => {
		window.zkit_sdk = undefined;
		const loginStub =
			sinon.stub(zerokitAdapter, 'login')
				.returnsPromise().resolves({ user: 'dummyUser@domain.com' });
		const parentElement = { appendChild: sinon.stub() };

		zerokitAdapter.getLoginForm(parentElement)
			.then(() => {
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
				.returnsPromise().resolves({ user_alias: 'dummyUser@domain.com' });

		const parentElement = { appendChild: sinon.stub() };
		zerokitAdapter.getRegistrationForm(parentElement)
			.then(() => {
				expect(registerStub).to.be.calledOnce;
				done();
			});

		registrationForm.onsubmit({ preventDefault: sinon.spy() });
	});

	it('getRegisterForm succeeds when zkit_sdk is undefined', (done) => {
		window.zkit_sdk = undefined;
		const registerStub =
			sinon.stub(zerokitAdapter, 'register')
				.returnsPromise().resolves({ user_alias: 'dummyUser@domain.com' });
		const parentElement = { appendChild: sinon.stub() };
		zerokitAdapter.getRegistrationForm(parentElement)
			.then(() => {
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

	it('logout succeeds', (done) => {
		zerokitAdapter.logout()
			.then((res) => {
				expect(res).to.equal('success');
				expect(zkit_sdk.logout).to.be.calledOnce;
				expect(sessionHandler.get('HC_Auth')).to.be.undefined;
				expect(sessionHandler.get('HC_Id')).to.be.undefined;
				expect(sessionHandler.get('HC_User')).to.be.undefined;
				expect(sessionHandler.get('HC_Refresh')).to.be.undefined;
				done();
			});
	});

	it('logout fails if zerokit logout fails', (done) => {
		zkit_sdk.logout = sinon.stub().returnsPromise().rejects('error');
		zerokitAdapter.logout()
			.catch((err) => {
				expect(err).to.equal('error');
				expect(zkit_sdk.logout).to.be.calledOnce;
				done();
			});
	});

	it('grantPermission succeeds', (done) => {
		UserService.user = {
			id: 'kjhgf',
			zerokit_id: 'fakeZkitId',
			tresor_id: 'fakeTresorId',
		};

		zerokitAdapter.grantPermission('fakeGranteeEmail')
			.then((res) => {
				expect(res).to.equal('fakeOperationId');
				expect(resolveUserByAliasStub).to.be.calledOnce;
				expect(zkit_sdk.shareTresor).to.be.calledOnce;
				expect(userRouteVerifyShareAndGrantPermissionStub).to.be.calledOnce;
				UserService.user = undefined;
				done();
			});
	});

	it('grantPermission fails if zerokit shareTresor fails', (done) => {
		zkit_sdk.shareTresor = sinon.stub().returnsPromise().rejects('error');
		zerokitAdapter.grantPermission('fakeGranteeEmail')
			.catch((err) => {
				expect(err).to.equal('error');
				expect(zkit_sdk.shareTresor).to.be.calledOnce;
				done();
			});
		done();
	});

	afterEach(() => {
		getCurrentUserStub.restore();
		userRoutes.addTresor.restore();
		userRoutes.verifyShareAndGrantPermission.restore();
		userRoutes.addTagEncryptionKey.restore();
	});
});
