/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import testVariables from '../../testUtils/testVariables';
import sessionHandler from '../../../src/lib/sessionHandler/node';


sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('sessionHandler node', () => {
    it('get and set sessionHandler succeeds', () => {
        sessionHandler.set('HC_User', `${testVariables.userId},${testVariables.userAlias}`);
        const userCookie = sessionHandler.get('HC_User');
        expect(userCookie).to.equal(`${testVariables.userId},${testVariables.userAlias}`);
    });

    it('deleteCookie sessionHandler succeeds', () => {
        sessionHandler.set('HC_User', `${testVariables.userId},${testVariables.userAlias}`);
        sessionHandler.deleteCookie('HC_User');
        expect(sessionHandler.get('HC_User')).to.be.undefined;
    });

    it('logout sessionHandler succeeds', () => {
        sessionHandler.set('HC_User', `${testVariables.userId},${testVariables.userAlias}`);
        sessionHandler.logout();
        expect(sessionHandler.get('HC_User')).to.be.undefined;
    });
});
