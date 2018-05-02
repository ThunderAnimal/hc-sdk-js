/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* eslint-disable max-nested-callbacks */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import userService from '../../src/services/userService';
import userRoutes from '../../src/routes/userRoutes';
import { NOT_SETUP } from '../../src/lib/errors/SetupError';
import testVariables from '../testUtils/testVariables';
import userResources from '../testUtils/userResources';
import encryptionResources from '../testUtils/encryptionResources';
import crypto from '../../src/lib/crypto';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

const base64privateKey = btoa(JSON.stringify(encryptionResources.privateKeyClientUser));

describe('services/userService', () => {
    let asymDecryptStub;
    let symDecryptStub;
    let getGrantedPermissionsStub;
    let getUserDetailsStub;
    let userInfoStub;
    let resolveUserIdStub;
    let updateUserStub;
    let getReceivedPermissionsStub;

    beforeEach(() => {
        asymDecryptStub = sinon.stub(crypto, 'asymDecryptString');
        symDecryptStub = sinon.stub(crypto, 'symDecryptObject');

        asymDecryptStub.withArgs(
            encryptionResources.privateKeyClientUser,
            encryptionResources.encryptedCommonKey,
        ).returnsPromise().resolves(JSON.stringify(encryptionResources.commonKey));

        symDecryptStub.withArgs(
            encryptionResources.commonKey,
            encryptionResources.encryptedTagEncryptionKey,
        ).returnsPromise().resolves(encryptionResources.symHCKey);

        getGrantedPermissionsStub = sinon.stub(userRoutes, 'getGrantedPermissions')
            .returnsPromise().resolves([{ owner_id: 'a', grantee_id: 'b' }]);
        getUserDetailsStub = sinon.stub(userRoutes, 'getUserDetails')
            .returnsPromise().resolves(userResources.userDetails);
        userInfoStub = sinon.stub(userRoutes, 'fetchUserInfo')
            .returnsPromise().resolves(userResources.fetchUserInfo);
        resolveUserIdStub = sinon.stub(userRoutes, 'resolveUserId')
            .returnsPromise().resolves({
                uid: testVariables.userId,
            });
        updateUserStub = sinon.stub(userRoutes, 'updateUser')
            .returnsPromise().resolves();
        getReceivedPermissionsStub = sinon.stub(userRoutes, 'getReceivedPermissions')
            .returnsPromise().resolves([encryptionResources.permissionResponse]);
    });

    describe('pullUser', () => {
        it('should pull the currentUser when private key is set', (done) => {
            userService.setPrivateKey(base64privateKey);
            userService.pullUser()
                .then((res) => {
                    const userId = userService.currentUserId;
                    expect(userId).to.deep.equal(testVariables.userId);
                    expect(res).to.deep.equal(userResources.cryptoUser);
                    done();
                })
                .catch(done);
        });

        it('should fail when private key is not set', (done) => {
            userService.pullUser()
                .catch((error) => {
                    expect(error.message).to.equal(NOT_SETUP);
                    done();
                });
        });
    });

    describe('getUser', () => {
        it('should return not pullUser, when user is set already', (done) => {
            userService.users[testVariables.userId] = userResources.cryptoUser;
            userService.getUser(testVariables.userId)
                .then((res) => {
                    expect(res).to.deep.equal(userResources.cryptoUser);
                    done();
                })
                .catch(done);
        });

        it('should return pullUser, when user is not set yet', (done) => {
            userService.setPrivateKey(base64privateKey);
            userService.users[testVariables.userId] = null;
            userService.getUser(testVariables.userId)
                .then((res) => {
                    expect(res).to.deep.equal(userResources.cryptoUser);
                    done();
                })
                .catch(done);
        });
    });

    describe('isCurrentUser', (done) => {
        it('Happy Path', () => {
            userService.setPrivateKey(base64privateKey);
            userService.pullUser()
                .then(() => {
                    const isCurrentUser = userService.isCurrentUser(testVariables.userId);
                    expect(isCurrentUser).to.equal(true);
                    done();
                });
        });
    });

    describe('resetUser', () => {
        it('should reset the userService', () => {
            userService.resetUser();
            expect(userService.users).to.deep.equal({});
            expect(userService.currentUserId).to.equal(null);
        });
    });

    describe('getReceivedPermissions', () => {
        it('maps permissions as expected', (done) => {
            userService.currentUserId = testVariables.userId;
            userService.getReceivedPermissions()
                .then((permissions) => {
                    expect(getReceivedPermissionsStub).to.be.calledOnce;
                    expect(getReceivedPermissionsStub).to.be.calledWith(testVariables.userId);
                    expect(Object.keys(permissions[0])).to.deep.equal(['appId', 'commonKey', 'grantee', 'granteePublicKey', 'id', 'owner', 'scope']);
                    done();
                })
                .catch(done);
        });

        it('should throw not setup error when currentUserId is null', (done) => {
            userService.getReceivedPermissions()
                .catch((err) => {
                    expect(getReceivedPermissionsStub).not.to.be.called;
                    expect(err.message).to.equal(NOT_SETUP);
                    done();
                })
                .catch(done);
        });
    });

    afterEach(() => {
        getGrantedPermissionsStub.restore();
        getUserDetailsStub.restore();
        resolveUserIdStub.restore();
        updateUserStub.restore();
        asymDecryptStub.restore();
        symDecryptStub.restore();
        userInfoStub.restore();
        userService.resetUser();
        getReceivedPermissionsStub.restore();
    });
});
