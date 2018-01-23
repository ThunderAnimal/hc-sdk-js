/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import sessionHandler from 'session-handler';
import userService from '../../src/services/userService';
import userRoutes from '../../src/routes/userRoutes';
import { NOT_LOGGED_IN } from '../../src/lib/errors/LoginError';
import { MISSING_PARAMETERS, INVALID_PARAMETERS } from '../../src/lib/errors/ValidationError';
import testVariables from '../testUtils/testVariables';
import userResources from '../testUtils/userResources';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('services/userService', () => {
    let decryptStub;
    let encryptStub;
    let getGrantedPermissionsStub;
    let getUserDetailsStub;
    let resolveUserIdStub;
    let sessionHandlerGetStub;
    let updateUserStub;

    beforeEach(() => {
        decryptStub = sinon.stub();
        decryptStub.withArgs(testVariables.encryptedUserData)
            .returns(Promise.resolve(JSON.stringify(testVariables.userData)));
        decryptStub.withArgs(testVariables.encryptedTek)
            .returns(Promise.resolve(testVariables.tek));
        encryptStub = sinon.stub()
            .returnsPromise().resolves(testVariables.encryptedUserData);
        getGrantedPermissionsStub = sinon.stub(userRoutes, 'getGrantedPermissions')
            .returnsPromise().resolves([{ owner_id: 'a', grantee_id: 'b' }]);
        getUserDetailsStub = sinon.stub(userRoutes, 'getUserDetails')
            .returnsPromise().resolves(userResources.userDetails);
        resolveUserIdStub = sinon.stub(userRoutes, 'resolveUserId')
            .returnsPromise().resolves({
                uid: testVariables.userId, zerokit_id: testVariables.zeroKitId,
            });
        sessionHandlerGetStub = sinon.stub(sessionHandler, 'getItem')
            .returns(`${testVariables.userId},${testVariables.userAlias}`);
        updateUserStub = sinon.stub(userRoutes, 'updateUser')
            .returnsPromise().resolves();


        userService.zeroKitAdapter = {
            decrypt: decryptStub,
            encrypt: encryptStub,
        };
    });

    it('getCurrentUser - Happy Path', (done) => {
        const userId = userService.getCurrentUser();
        expect(userId).to.deep.equal({ id: testVariables.userId, alias: testVariables.userAlias });
        expect(sessionHandlerGetStub).to.be.calledTwice;
        done();
    });

    it('getCurrentUser - fails when user is not logged in', (done) => {
        sessionHandlerGetStub.returns(null);
        const user = userService.getCurrentUser();
        expect(user).to.equal(undefined);
        expect(sessionHandlerGetStub).to.be.calledOnce;
        done();
    });

    it('isCurrentUser - Happy Path', () => {
        const isCurrentUser = userService.isCurrentUser(testVariables.userId);
        expect(isCurrentUser).to.equal(true);
        expect(sessionHandlerGetStub).to.be.calledTwice;
    });

    it('getInternalUser - Happy Path', (done) => {
        userService.user = undefined;
        userService.getInternalUser()
            .then((res) => {
                expect(res.tek).to.equal(testVariables.tek);
                expect(res.zeroKitId).to.equal(testVariables.zeroKitId);
                expect(res.tresorId).to.equal(testVariables.tresorId);
                expect(res.state).to.equal(testVariables.state);
                expect(res.userData).to.deep.equal(testVariables.userData);
                expect(getUserDetailsStub).to.be.calledOnce;
                expect(decryptStub).to.be.calledTwice;
                done();
            })
            .catch(console.log);
    });

    it('getInternalUser - fails when getUserDetails fails', (done) => {
        userService.user = undefined;
        getUserDetailsStub.rejects();
        userService.getInternalUser().catch(() => {
            expect(getUserDetailsStub).to.be.calledOnce;
            done();
        });
    });

    it('getUser - Happy Path', (done) => {
        userService.user = undefined;
        userService.getUser()
            .then((res) => {
                expect(res.tek).to.equal(undefined);
                expect(res.zeroKitId).to.equal(undefined);
                expect(res.tresorId).to.equal(undefined);
                expect(res.state).to.equal(testVariables.state);
                expect(res.userData).to.deep.equal(testVariables.userData);
                expect(getUserDetailsStub).to.be.calledOnce;
                expect(decryptStub).to.be.calledTwice;
                done();
            })
            .catch(console.log);
    });

    it('resolveUser succeeds', (done) => {
        userService.resolveUser(testVariables.userAlias)
            .then((res) => {
                expect(res).to.deep.equal({
                    id: testVariables.userId,
                    zeroKitId: testVariables.zeroKitId,
                });
                expect(resolveUserIdStub).to.be.calledOnce;
                done();
            })
            .catch(console.log);
    });

    it('getUserIdForAlias - Happy Path', (done) => {
        userService.getUserIdForAlias(testVariables.userAlias)
            .then((res) => {
                expect(res).to.equal(testVariables.userId);
                expect(resolveUserIdStub).to.be.calledOnce;
                done();
            })
            .catch(console.log);
    });

    it('resolveUser - fails when resolveUserId fails', (done) => {
        resolveUserIdStub.rejects();
        userService.resolveUser().catch(() => {
            expect(resolveUserIdStub).to.be.calledOnce;
            done();
        });
    });

    it('updateUser - Happy Path', (done) => {
        userService.user = undefined;
        userService.updateUser({ name: 'Glumli' }).then(() => {
            expect(getUserDetailsStub).to.be.calledOnce;
            expect(encryptStub).to.be.calledOnce;
            done();
        });
    });

    it('updateUser - fails when no user is logged in', (done) => {
        sessionHandlerGetStub.withArgs('HC_Auth').returns(null);
        userService.updateUser({ name: 'Glumli' }).catch((res) => {
            expect(res.message).to.equal(NOT_LOGGED_IN);
            done();
        });
    });

    it('updateUser - fails updateUserCall fails', (done) => {
        updateUserStub.rejects();
        userService.updateUser({ name: 'fakeName' }).catch(() => {
            expect(getUserDetailsStub).to.be.calledOnce;
            expect(updateUserStub).to.be.calledOnce;
            done();
        });
    });

    it('updateUser - fails when no parameters are passed', (done) => {
        userService.updateUser().catch((res) => {
            expect(res.message).to.equal(MISSING_PARAMETERS);
            done();
        });
    });

    it('updateUser - fails when parameters is not an object', (done) => {
        userService.updateUser('string').catch((res) => {
            expect(res.message).to.equal(`${INVALID_PARAMETERS}: parameter is not an object`);
            done();
        });
    });

    it('updateUser - fails when parameters is an empty object', (done) => {
        userService.updateUser({}).catch((res) => {
            expect(res.message).to.equal(`${INVALID_PARAMETERS}: object is empty`);
            done();
        });
    });

    it('getGrantedPermissions - Happy Path', (done) => {
        userService.getGrantedPermissions()
            .then((res) => {
                expect(res).to.deep.equal([{ granteeId: 'b' }]);
                expect(getGrantedPermissionsStub).to.be.calledOnce;
                done();
            })
            .catch(console.log);
    });

    it('getGrantedPermissions - fails when no user logged in', (done) => {
        userService.user = undefined;
        sessionHandlerGetStub.returns(null);
        userService.getGrantedPermissions()
            .catch((res) => {
                userRoutes.getGrantedPermissions.restore();
                expect(res.message).to.equal(NOT_LOGGED_IN);
                expect(getGrantedPermissionsStub).to.not.be.called;
                done();
            })
            .catch(console.log);
    });

    it('getGrantedPermissions - fails when getGrantedPermissions fails', (done) => {
        userService.user = undefined;
        getGrantedPermissionsStub.rejects();
        userService.getGrantedPermissions().catch(() => {
            expect(getGrantedPermissionsStub).to.be.calledOnce;
            done();
        });
    });

    it('resets the user successfully', () => {
        userService.resetUser();
        expect(userService.user).to.equal(null);
    });

    afterEach(() => {
        getGrantedPermissionsStub.restore();
        getUserDetailsStub.restore();
        resolveUserIdStub.restore();
        sessionHandlerGetStub.restore();
        updateUserStub.restore();
    });
});
