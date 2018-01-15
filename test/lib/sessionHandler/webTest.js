/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import sessionHandler from 'session-handler';


sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;


describe('sessionHandler web', () => {
    beforeEach(() => {
        document.cookie = 'SQLiteManager_currentLangue=2';
        document.cookie = ' HC_User=fakeUserId1,fakeUserAlias1';
    });

    it('get sessionHandler succeeds', () => {
        const userCookie = sessionHandler.get('HC_User');
        expect(userCookie).to.equal('fakeUserId1,fakeUserAlias1');
    });

    it('set sessionHandler succeeds', () => {
        sessionHandler.set('HC_User', 'fakeUserId,fakeUserAlias');
        expect(document.cookie).to.include('HC_User=fakeUserId,fakeUserAlias');
    });

    it('deleteCookie sessionHandler succeeds', () => {
        sessionHandler.set('HC_User', 'fakeUserId,fakeUserAlias');
        sessionHandler.deleteCookie('HC_User');
        expect(sessionHandler.get('HC_User')).to.be.undefined;
    });

    it('logout sessionHandler succeeds', () => {
        sessionHandler.set('HC_User', 'fakeUserId,fakeUserAlias');
        sessionHandler.logout();
        expect(sessionHandler.get('HC_User')).to.be.undefined;
    });
});
