/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';

import createCryptoService from '../../src/services/encryptionService';

import mock from '../mockData';

import cryptoLib from '../../src/lib/crypto';
import cryptoRoutes from '../../src/routes/encryptionRoutes';

sinonStubPromise(sinon);
chai.use(sinonChai);

describe('encryptionService', () => {
    let getDistributedKey;
    let asymDecrypt;
    let generateSymKey;
    let symEncryptDataKey;
    let symEncryptData;
    let symDecryptDataKey;
    let symDecryptData;

    beforeEach(() => {
        getDistributedKey = sinon.stub(cryptoRoutes, 'getDistributedKey')
            .returnsPromise()
            .withArgs(mock.clientID, mock.userID)
            .resolves(mock.distributedKeyJWK);

        asymDecrypt = sinon.stub(cryptoLib, 'asymDecrypt')
            .returnsPromise()
            .withArgs(mock.privateClientUserJWK, mock.distributedKeyJWK)
            .resolves(mock.commonKey);

        generateSymKey = sinon.stub(cryptoLib, 'generateSymKey')
            .returnsPromise()
            .resolves(mock.dataKey);

        const symEncrypt = sinon.stub(cryptoLib, 'symEncrypt');

        symEncryptDataKey = symEncrypt.returnsPromise()
            .withArgs(mock.commonKey, mock.dataKey)
            .resolves(mock.encryptedDataKey);

        symEncryptData = symEncrypt.returnsPromise()
            .withArgs(mock.dataKey, mock.data)
            .resolves(mock.encryptedData);

        const symDecrypt = sinon.stub(cryptoLib, 'symDecrypt');

        symDecryptDataKey = symDecrypt.returnsPromise()
            .withArgs(mock.commonKey, mock.encryptedDataKey)
            .resolves(mock.dataKey);

        symDecryptData = symDecrypt.returnsPromise()
            .withArgs(mock.dataKey, mock.encryptedData)
            .resolves(mock.data);
    });

    afterEach(() => {
        // eslint-disable no-unused-expressions
        cryptoRoutes.getDistributedKey.restore();
        cryptoLib.asymDecrypt.restore();
        cryptoLib.generateSymKey.restore();
        cryptoLib.symEncrypt.restore();
        cryptoLib.symDecrypt.restore();
        // eslint-enable no-unused-expressions
    });

    it('should be possible to encrypt document', (done) => {
        const {
            encryptData,
        } = createCryptoService(mock.clientID)(mock.privateClientUserJWK)(mock.userID);

        encryptData(mock.data)
            .then(([receivedEncryptedData, receivedEncryptedDataKey]) => {
                expect(receivedEncryptedData).to.be.equal(mock.encryptedData);
                expect(receivedEncryptedDataKey).to.be.equal(mock.encryptedDataKey);

                // common key
                expect(getDistributedKey).to.be.calledOnce;
                expect(getDistributedKey).to.be.calledWith(mock.clientID, mock.userID);
                expect(asymDecrypt).to.be.calledOnce;
                expect(asymDecrypt).to.be.calledWith(
                    mock.privateClientUserJWK,
                    mock.distributedKeyJWK);
                // encryption
                expect(symEncryptDataKey).to.be.calledOnce;
                expect(symEncryptDataKey).to.be.calledWith(mock.commonKey, mock.dataKey);
                expect(symEncryptData).to.be.calledOnce;
                expect(symEncryptData).to.be.calledWith(mock.dataKey, mock.data);
            })
            .then(() => done())
            .catch(done);
    });

    it('should be possible to decrypt document', (done) => {
        const {
            decryptData,
        } = createCryptoService(mock.clientID)(mock.privateClientUserJWK)(mock.userID);

        decryptData(mock.encryptedData, mock.encryptedDataKey)
            .then((receivedData) => {
                expect(receivedData).to.be.equal(mock.data);

                // common key
                expect(getDistributedKey).to.be.calledOnce;
                expect(getDistributedKey).to.be.calledWith(mock.clientID, mock.userID);
                expect(asymDecrypt).to.be.calledOnce;
                expect(asymDecrypt).to.be.calledWith(
                    mock.privateClientUserJWK,
                    mock.distributedKeyJWK);
                // decryption
                expect(symDecryptDataKey).to.be.calledOnce;
                expect(symDecryptDataKey).to.be.calledWith(mock.commonKey, mock.encryptedDataKey);
                expect(symDecryptData).to.be.calledOnce;
                expect(symDecryptData).to.be.calledWith(mock.dataKey, mock.encryptedData);
            })
            .then(() => done())
            .catch(done);
    });
});
