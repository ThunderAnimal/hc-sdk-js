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
import { MISSING_PARAMETERS, INVALID_PARAMETERS } from '../../src/lib/errors/ValidationError';
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
    let encryptStub;
    let getGrantedPermissionsStub;
    let getUserDetailsStub;
    let userInfoStub;
    let resolveUserIdStub;
    let updateUserStub;

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
        ).returnsPromise().resolves(encryptionResources.tagEncryptionKey);

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
    });

    describe('fetchCurrentUser', () => {
        it('should succeed when private key is set', (done) => {
            userService.setPrivateKey(base64privateKey);
            userService.pullCurrentUser()
                .then(() => {
                    const userId = userService.currentUserId;
                    expect(userId).to.deep.equal(testVariables.userId);
                    done();
                })
                .catch(done);
        });

        it('should fail when private key is not set', (done) => {
            try {
                userService.pullCurrentUser();
            } catch (error) {
                expect(error.message).to.equal(NOT_SETUP);
                done();
            }
        });
    });

    describe('isCurrentUser', (done) => {
        it('Happy Path', () => {
            userService.setPrivateKey(base64privateKey);
            userService.pullCurrentUser()
                .then(() => {
                    const isCurrentUser = userService.isCurrentUser(testVariables.userId);
                    expect(isCurrentUser).to.equal(true);
                    done();
                });
        });
    });

    describe('getInternalUser', () => {
        it('Happy Path', (done) => {
            expect(symDecryptStub).to.not.be.called;
            userService.setPrivateKey(base64privateKey);
            userService.pullCurrentUser()
                .then(() => {
                    userService.getInternalUser()
                        .then((res) => {
                            expect(res.tek).to.equal(encryptionResources.tagEncryptionKey);
                            expect(symDecryptStub).to.be.calledOnce;
                            expect(asymDecryptStub).to.be.calledOnce;
                            done();
                        });
                })
                .catch(done);
        });
    });


    describe.skip('getUser', () => {
        it('should return the exposable informations about the user', (done) => {
            userService.user = undefined;
            userService.getUser()
                .then((res) => {
                    expect(res.tek).to.equal(undefined);
                    expect(res.zeroKitId).to.equal(undefined);
                    expect(res.tresorId).to.equal(undefined);
                    expect(res.state).to.equal(testVariables.state);
                    expect(res.userData).to.deep.equal(testVariables.userData);
                    expect(getUserDetailsStub).to.be.calledOnce;
                    done();
                })
                .catch(done);
        });
    });

    describe.skip('resolveUser', () => {
        it('succeeds', (done) => {
            userService.resolveUser(testVariables.userAlias)
                .then((res) => {
                    expect(res).to.deep.equal({
                        id: testVariables.userId,
                    });
                    expect(resolveUserIdStub).to.be.calledOnce;
                    done();
                })
                .catch(done);
        });

        it('resolveUser - fails when resolveUserId fails', (done) => {
            resolveUserIdStub.rejects();
            userService.resolveUser().catch(() => {
                expect(resolveUserIdStub).to.be.calledOnce;
                done();
            });
        });
    });

    describe('getUserIdForAlias', () => {
        it('getUserIdForAlias - Happy Path', (done) => {
            userService.getUserIdForAlias(testVariables.userAlias)
                .then((res) => {
                    expect(res).to.equal(testVariables.userId);
                    expect(resolveUserIdStub).to.be.calledOnce;
                    done();
                })
                .catch(done);
        });
    });

    describe.skip('updateUser', () => {
        it('Happy Path', (done) => {
            userService.user = undefined;
            userService.updateUser({ name: 'Glumli' })
                .then(() => {
                    expect(getUserDetailsStub).to.be.calledOnce;
                    expect(encryptStub).not.to.be.called;
                    done();
                })
                .catch(done);
        });

        // TODO unskip, when error is thrown in getCurrentUser
        it.skip('fails when no user is logged in', (done) => {
            userService.currentUser = undefined;
            userService.updateUser({ name: 'Glumli' })
                .then(res => done(new Error(res)))
                .catch((res) => {
                    expect(res.message).to.equal(NOT_SETUP);
                    done();
                });
        });

        it('fails updateUserCall fails', (done) => {
            updateUserStub.rejects();
            userService.updateUser({ name: 'fakeName' }).catch(() => {
                expect(getUserDetailsStub).to.be.calledOnce;
                expect(updateUserStub).to.be.calledOnce;
                done();
            });
        });

        it('fails when no parameters are passed', (done) => {
            userService.updateUser().catch((res) => {
                expect(res.message).to.equal(MISSING_PARAMETERS);
                done();
            });
        });

        it('fails when parameters is not an object', (done) => {
            userService.updateUser('string').catch((res) => {
                expect(res.message).to.equal(`${INVALID_PARAMETERS}: parameter is not an object`);
                done();
            });
        });

        it('fails when parameters is an empty object', (done) => {
            userService.updateUser({}).catch((res) => {
                expect(res.message).to.equal(`${INVALID_PARAMETERS}: object is empty`);
                done();
            });
        });
    });

    describe('resetUser', () => {
        it('should reset the userService', () => {
            userService.resetUser();
            expect(userService.user).to.equal(null);
            expect(userService.currentUserId).to.equal(null);
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
    });
});
