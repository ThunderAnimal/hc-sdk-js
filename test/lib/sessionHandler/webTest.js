/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import proxy from 'proxyquireify';

import testVariables from '../../testUtils/testVariables';
import '../../../src/lib/sessionHandler/web';

const proxyquire = proxy(require);


sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;


describe('sessionHandler web', () => {
    let sessionHandler;

    describe('localStorage available', () => {
        beforeEach(() => {
            window.localStorage.clear();
            sessionHandler = proxyquire('../../../src/lib/sessionHandler/web', {
                '../environmentUtils': { default: { getLocalStorage: sinon.stub().returns(window.localStorage) } },
            }).default;
        });

        it('should be possible to get the value for a given key', () => {
            window.localStorage.setItem('HC_User', `${testVariables.userId},${testVariables.userAlias}`);
            const user = sessionHandler.getItem('HC_User');
            expect(user).to.equal(`${testVariables.userId},${testVariables.userAlias}`);
        });

        it('should be possible to set a given value for a given key', () => {
            sessionHandler.setItem('HC_User', `${testVariables.userId},${testVariables.userAlias}`);
            expect(window.localStorage.getItem('HC_User')).to.equal(`${testVariables.userId},${testVariables.userAlias}`);
        });

        it('should be possible to delete the value for a given key', () => {
            sessionHandler.removeItem('HC_User');
            expect(window.localStorage.getItem('HC_User')).to.equal(null);
        });

        it('should be possible to remove HC specific values by calling logout', () => {
            window.localStorage.setItem('HC_User', `${testVariables.userId},${testVariables.userAlias}`);
            sessionHandler.logout();
            expect(window.localStorage.getItem('HC_User')).to.equal(null);
        });
    });

    describe('localStorage not available', () => {
        beforeEach(() => {
            sessionHandler = proxyquire('../../../src/lib/sessionHandler/web', {
                '../environmentUtils': { default: { getLocalStorage: sinon.stub().returns(undefined) } },
            }).default;
        });

        it('should be possible to get the value for a given key', () => {
            document.cookie = `HC_User=${testVariables.userId},${testVariables.userAlias}`;
            const userCookie = sessionHandler.getItem('HC_User');
            expect(userCookie).to.equal(`${testVariables.userId},${testVariables.userAlias}`);
        });

        it('should be possible to set a given value for a given key', () => {
            document.cookie = `HC_User=${testVariables.userId},${testVariables.userAlias}`;
            expect(document.cookie).to.include(`${testVariables.userId},${testVariables.userAlias}`);
        });

        it('should be possible to delete the value for a given key', () => {
            document.cookie = `HC_User=${testVariables.userId},${testVariables.userAlias}`;
            sessionHandler.removeItem('HC_User');
            expect(sessionHandler.getItem('HC_User')).to.be.undefined;
        });

        it('should be possible to remove HC specific values by calling logout', () => {
            document.cookie = `HC_User=${testVariables.userId},${testVariables.userAlias}`;
            sessionHandler.logout();
            expect(sessionHandler.getItem('HC_User')).to.be.undefined;
        });
    });
});
