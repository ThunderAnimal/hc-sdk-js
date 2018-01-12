/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import sessionHandler from 'session-handler';
import UserService from '../../src/services/UserService';
import userRoutes from '../../src/routes/userRoutes';
import ZerokitAdapter from '../../src/services/ZeroKitAdapter';
import * as loginForm from '../../src/templates/loginForm';
import testVariables from '../testUtils/testVariables';
import userResources from '../testUtils/userResources';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('zerokitAdapter', () => {
	let addTagEncryptionKeyStub;
	let addTresorStub;
	let authServiceLogoutStub;
	let createTresorStub;
	let decryptStub;
	let encryptStub;
	let getCurrentUserStub;
	let getElementByIdStub;
	let getInternalUserStub;
	let getLoginIframeStub;
	let idpLoginStub;
	let initRegistrationStub;
	let loginStub;
	let logoutStub;
	let loginNodeStub;
	let registerStub;
	let resolveUserStub;
	let sessionHandlerLogoutStub;
	let sessionHandlerSetStub;
	let shareTresorStub;
	let validateRegistrationStub;
	let verifyShareAndGrantPermissionStub;

	let authService;
	let zerokitAdapter;
	let zerokitAdapterNode;
	let zKitLoginObject;
	let zKitLoginObjectPromise;
	let zKitRegisterObject;
	let zKitRegisterObjectPromise;
	let zeroKit;
	let zeroKitNode;
	let zeroKitPromise;

	beforeEach(() => {
		addTagEncryptionKeyStub = sinon.stub(userRoutes, 'addTagEncryptionKey')
			.returnsPromise().resolves();
		addTresorStub = sinon.stub(userRoutes, 'addTresor')
			.returnsPromise().resolves();
		authServiceLogoutStub = sinon.stub()
			.returnsPromise().resolves();
		createTresorStub = sinon.stub()
			.returnsPromise().resolves(testVariables.tresorId);
		decryptStub = sinon.stub()
			.returnsPromise().resolves(testVariables.string);
		encryptStub = sinon.stub()
			.returnsPromise().resolves(testVariables.encryptedString);
		getCurrentUserStub = sinon.stub()
			.returns(userResources.currentUser);
		getElementByIdStub = sinon.stub(window.document, 'getElementById')
			.returns({ value: testVariables.userAlias });
		getInternalUserStub = sinon.stub()
			.returnsPromise().resolves(userResources.internalUser);
		idpLoginStub = sinon.stub()
			.returnsPromise().resolves();
		initRegistrationStub = sinon.stub(userRoutes, 'initRegistration')
			.returnsPromise().resolves(
				{ session_id: testVariables.sessionId, zerokit_id: testVariables.zeroKitId });
		loginStub = sinon.stub()
			.returnsPromise().resolves(testVariables.zeroKitId);
		loginNodeStub = sinon.stub().returnsPromise()
			.withArgs(testVariables.zeroKitId, testVariables.password)
			.resolves('success');
		logoutStub = sinon.stub()
			.returnsPromise().resolves();
		registerStub = sinon.stub()
			.returnsPromise().resolves(
				{ RegValidationVerifier: testVariables.regValidationVerifier });
		resolveUserStub = sinon.stub()
			.returnsPromise().resolves(userResources.resolvedUser);
		sessionHandlerSetStub = sinon.stub(sessionHandler, 'set')
			.returns();
		sessionHandlerLogoutStub = sinon.stub(sessionHandler, 'logout')
			.returns();
		shareTresorStub = sinon.stub()
			.returnsPromise().resolves(testVariables.operationId);
		validateRegistrationStub = sinon.stub(userRoutes, 'validateRegistration')
			.returnsPromise().resolves();
		verifyShareAndGrantPermissionStub = sinon.stub(userRoutes, 'verifyShareAndGrantPermission')
			.returnsPromise().resolves();


		authService = {
			idpLogin: idpLoginStub,
			logout: authServiceLogoutStub,
			clientCredentialsLogin: sinon.stub().returnsPromise().withArgs(testVariables.userId)
				.resolves(),
		};

		zKitLoginObject = { login: loginStub };
		zKitLoginObjectPromise = Promise.resolve(zKitLoginObject);

		zKitRegisterObject = { login: loginStub, register: registerStub };
		zKitRegisterObjectPromise = Promise.resolve(zKitRegisterObject);

		getLoginIframeStub = sinon.stub().returnsPromise().resolves(zKitLoginObject);
		zeroKit = {
			createTresor: createTresorStub,
			decrypt: decryptStub,
			encrypt: encryptStub,
			getLoginIframe: getLoginIframeStub,
			logout: logoutStub,
			shareTresor: shareTresorStub,
		};

		zeroKitNode = {
			login: loginNodeStub,
			createTresor: createTresorStub,
		};

		zeroKitPromise = Promise.resolve(zeroKit);

		zerokitAdapter = new ZerokitAdapter({ authService });
		zerokitAdapter.zeroKit = zeroKitPromise;
		zerokitAdapter.zKitRegistrationObject = zKitRegisterObjectPromise;

		zerokitAdapterNode = new ZerokitAdapter({ authService });
		zerokitAdapterNode.zeroKit = Promise.resolve(zeroKitNode);

		UserService.getCurrentUser = getCurrentUserStub;
		UserService.getInternalUser = getInternalUserStub;
		UserService.resolveUser = resolveUserStub;
		UserService.user = {};
	});


	it('login - createsTresor and tek on first login', (done) => {
		const internalUser = Object.assign({}, userResources.internalUser);
		internalUser.tek = undefined;
		internalUser.tresorId = undefined;
		getInternalUserStub.resolves(internalUser);
		zerokitAdapter.login(zKitLoginObjectPromise, testVariables.userAlias)
			.then((res) => {
				expect(res.alias).to.equal(testVariables.userAlias);
				expect(addTagEncryptionKeyStub).to.be.calledOnce;
				expect(addTresorStub).to.be.calledOnce;
				expect(zKitLoginObject.login).to.be.calledOnce;
				expect(UserService.user.tresorId).to.equal(testVariables.tresorId);

				done();
			})
			.catch(done);
	});

	it('login - rejects when idpLogin fails', (done) => {
		idpLoginStub.rejects();

		zerokitAdapter.login(zKitLoginObjectPromise, testVariables.userAlias)
			.catch(() => {
				expect(resolveUserStub).to.be.calledOnce;
				expect(zKitLoginObject.login).to.be.calledOnce;
				expect(getInternalUserStub).not.to.be.called;

				done();
			})
			.catch(done);
	});

	it('login - callback rejects when resolveUser call fails ', (done) => {
		resolveUserStub.rejects();

		zerokitAdapter.login(zKitLoginObjectPromise, testVariables.userAlias)
			.then(() => done(Error('resolveUserStub rejection didn\'t work properly in zerokitAdapter.login')))
			.catch(() => {
				expect(resolveUserStub).to.be.calledOnce;
				expect(idpLoginStub).not.to.be.called;

				done();
			});
	});

	it('login - tresor and tek are not created on login when user has them already', (done) => {
		zerokitAdapter.login(zKitLoginObjectPromise, testVariables.userAlias)
			.then((res) => {
				expect(res.alias).to.equal(testVariables.userAlias);
				expect(resolveUserStub).to.be.calledOnce;
				expect(createTresorStub).not.to.be.called;
				expect(addTresorStub).not.to.be.called;
				expect(loginStub).to.be.calledOnce;
				expect(addTagEncryptionKeyStub).not.to.be.called;

				done();
			})
			.catch(done);
	});

	it('loginNode - createsTresor and tek on first login', (done) => {
		UserService.getInternalUser = resolveUserStub;

		zerokitAdapterNode.loginNode(testVariables.userAlias, testVariables.password)
			.then(() => {
				expect(zeroKitNode.login).to.be.calledOnce;
				expect(zeroKitNode.createTresor).to.be.calledOnce;
				done();
			})
			.catch(done);
	});

	it('loginNode - createsTresor and tek not called if already present', (done) => {
		zerokitAdapterNode.loginNode(testVariables.userAlias, testVariables.password)
			.then(() => {
				expect(zeroKitNode.login).to.be.calledOnce;
				expect(zeroKitNode.createTresor).to.not.be.called;
				done();
			})
			.catch(done);
	});

	it('loginNode - rejects when wrong zerokit password is entered', (done) => {
		loginNodeStub.rejects('error');

		zerokitAdapterNode.loginNode(testVariables.userAlias, testVariables.wrongPassword)
			.catch(() => {
				expect(zeroKitNode.login).to.be.calledOnce;
				expect(zeroKitNode.createTresor).to.not.be.called;
				done();
			})
			.then(() => done(Error('loginNode rejection didn\'t work properly in zerokitAdapter.loginNode')));
	});


	it('register - Happy Path', (done) => {
		zerokitAdapter.register()
			.then((res) => {
				expect(res.alias).to.equal(testVariables.userAlias);
				expect(initRegistrationStub).to.be.calledOnce;
				expect(validateRegistrationStub).to.be.calledOnce;
				expect(zKitRegisterObject.register).to.be.calledOnce;
				done();
			})
			.catch(done);
	});

	it('register - rejects when userAlias is not an email', (done) => {
		getElementByIdStub.returns({ value: testVariables.userAlias.split('@')[0] });
		zerokitAdapter.register()
			.then(() => done(Error('email validation didn\'t work properly in zerokitAdapter.register')))
			.catch((err) => {
				expect(err.name).to.equal('ValidationError');
				done();
			});
	});

	it('register - rejects when initRegistration fails', (done) => {
		initRegistrationStub.rejects();
		zerokitAdapter.register()
			.then(() => done(Error('initRegistrationStub rejection didn\'t work properly in zerokitAdapter.register')))
			.catch((err) => {
				expect(initRegistrationStub).to.be.calledOnce;
				expect(validateRegistrationStub).to.not.be.called;
				expect(registerStub).to.not.be.called;

				done();
			});
	});

	it('register - logs in after registration when autoLogin flag is set', (done) => {
		zerokitAdapter.register(true)
			.then((res) => {
				expect(res.alias).to.equal(testVariables.userAlias);
				expect(initRegistrationStub).to.be.calledOnce;
				expect(validateRegistrationStub).to.be.calledOnce;
				expect(zKitRegisterObject.register).to.be.calledOnce;

				expect(resolveUserStub).to.be.calledOnce;
				expect(createTresorStub).not.to.be.called;
				expect(addTresorStub).not.to.be.called;
				expect(loginStub).to.be.calledOnce;
				expect(addTagEncryptionKeyStub).not.to.be.called;
				done();
			})
			.catch(done);
	});

	it('encrypt - Happy Path', (done) => {
		zerokitAdapter.encrypt(testVariables.userId, testVariables.string)
			.then((res) => {
				expect(encryptStub).to.be.calledOnce;
				expect(encryptStub).to.be.calledWith(testVariables.tresorId, testVariables.string);
				expect(res).to.equal(testVariables.encryptedString);
				done();
			})
			.catch(done);
	});

	it('decrypt - Happy Path', (done) => {
		zerokitAdapter.decrypt(testVariables.encryptedString)
			.then((res) => {
				expect(decryptStub).to.be.calledOnce;
				expect(decryptStub).to.be.calledWith(testVariables.encryptedString);
				expect(res).to.equal(testVariables.string);
				done();
			})
			.catch(done);
	});

	it('getLoginForm - Happy Path', (done) => {
		const parentElement = { appendChild: sinon.stub() };

		const createdLoginForm = loginForm.createLoginFormTemplate();
		const createLoginFormStub = sinon.stub(loginForm, 'createLoginFormTemplate').returns(createdLoginForm);

		zerokitAdapter.getLoginForm(parentElement)
			.then(() => {
				expect(loginStub).to.be.calledOnce;
				expect(createLoginFormStub).to.be.calledOnce;
				done();
			})
			.catch(done);

		createdLoginForm.onsubmit({ preventDefault: sinon.spy() });
	});

	it('getRegisterForm succeeds', (done) => {
		const parentElement = { appendChild: sinon.stub() };

		zerokitAdapter.getRegistrationForm(parentElement)
			.then(() => {
				expect(getElementByIdStub).to.be.calledOnce;
				done();
			})
			.catch(done);
	});

	it('logout - Happy Path', (done) => {
		zerokitAdapter.logout()
			.then(() => {
				expect(logoutStub).to.be.calledOnce;
				expect(authServiceLogoutStub).to.be.calledOnce;
				done();
			})
			.catch(done);
	});

	it('logout - rejects when zerokit logout fails', (done) => {
		logoutStub.rejects();
		zerokitAdapter.logout()
			.then(() => done(
				Error('logoutStub rejection didn\'t work properly in zerokitAdapter.logout')))
			.catch(() => {
				expect(logoutStub).to.be.calledOnce;
				done();
			});
	});

	it('grantPermission - Happy Path', (done) => {
		zerokitAdapter.grantPermission(testVariables.userAlias)
			.then((res) => {
				expect(resolveUserStub).to.be.calledOnce;
				expect(shareTresorStub).to.be.calledOnce;
				expect(getInternalUserStub).to.be.calledOnce;
				expect(verifyShareAndGrantPermissionStub).to.be.calledOnce;
				done();
			})
			.catch(done);
	});

	it('grantPermission - swallows error when zerokit returns AlreadyMember error', (done) => {
		shareTresorStub.rejects({ message: 'AlreadyMember' });

		zerokitAdapter.grantPermission('fakeGranteeEmail')
			.then((res) => {
				expect(resolveUserStub).to.be.calledOnce;
				expect(shareTresorStub).to.be.calledOnce;
				expect(getInternalUserStub).to.be.calledOnce;
				expect(verifyShareAndGrantPermissionStub).to.not.be.calledOnce;
				done();
			})
			.catch(done);
	});

	it('grantPermission - rejects when zeroKits shareTresor fails', (done) => {
		shareTresorStub.rejects();
		zerokitAdapter.grantPermission(testVariables.userAlias)
			.then(() => done(
				Error('shareTresorStub rejection didn\'t work properly in zerokitAdapter.grantPermission')))
			.catch(() => {
				expect(shareTresorStub).to.be.calledOnce;
				expect(verifyShareAndGrantPermissionStub).not.to.be.called;
				done();
			});
	});

	afterEach(() => {
		addTagEncryptionKeyStub.restore();
		addTresorStub.restore();
		getElementByIdStub.restore();
		initRegistrationStub.restore();
		sessionHandlerSetStub.restore();
		sessionHandlerLogoutStub.restore();
		validateRegistrationStub.restore();
		verifyShareAndGrantPermissionStub.restore();
	});
});
