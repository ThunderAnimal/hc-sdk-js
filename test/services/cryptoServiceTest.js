/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable max-nested-callbacks */
import 'babel-polyfill';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import proxy from 'proxyquireify';

import '../../src/services/cryptoService';

import encryptionResources from '../testUtils/encryptionResources';

import cryptoLib from '../../src/lib/crypto';
import cryptoRoutes from '../../src/routes/cryptoRoutes';

const proxyquire = proxy(require);
sinonStubPromise(sinon);
chai.use(sinonChai);

describe('cryptoService', () => {
    let createCryptoService;

    let getCommonKeyStub;
    let getUserPublicKey;
    let asymDecryptStringStub;
    let asymEncrypt;
    let generateSymKeyStub;
    let symEncryptObjectStub;
    let symEncryptStub;
    let symDecryptStub;
    let symDecryptStringStub;
    let symDecryptDataKey;
    let symDecryptData;

    beforeEach(() => {
        getCommonKeyStub = sinon.stub()
            .returnsPromise()
            .resolves(encryptionResources.encryptedCommonKeyJWK);

        asymDecryptStringStub = sinon.stub()
            .returnsPromise()
            .resolves(JSON.stringify(encryptionResources.commonKey));

        generateSymKeyStub = sinon.stub()
            .returnsPromise()
            .resolves(encryptionResources.dataKey);

        symEncryptStub = sinon.stub()
            .returnsPromise()
            .resolves(encryptionResources.encryptedData);

        symEncryptObjectStub = sinon.stub()
            .returnsPromise()
            .resolves(encryptionResources.encryptedDataKey);

        symDecryptStub = sinon.stub()
            .returnsPromise()
            .resolves(encryptionResources.data);

        symDecryptStringStub = sinon.stub()
            .returnsPromise()
            .resolves(JSON.stringify(encryptionResources.dataKey));

        createCryptoService = proxyquire('../../src/services/cryptoService', {
            '../lib/crypto': {
                default: {
                    asymDecryptString: asymDecryptStringStub,
                    generateSymKey: generateSymKeyStub,
                    symEncrypt: symEncryptStub,
                    symEncryptObject: symEncryptObjectStub,
                    symDecrypt: symDecryptStub,
                    symDecryptString: symDecryptStringStub,
                },
            },
            '../routes/cryptoRoutes': {
                default: {
                    getCommonKey: getCommonKeyStub,
                },
            },
        }).default;
    });

    describe('encrypytArrayBufferView', () => {
        let encryptArrayBufferView;
        beforeEach(() => {
            encryptArrayBufferView = createCryptoService(
                encryptionResources.clientID)(
                encryptionResources.privateClientUserJWK)(
                encryptionResources.userID)
                .encryptArrayBufferView;
        });

        it('happyPath', (done) => {
            encryptArrayBufferView(encryptionResources.data)
                .then(([receivedEncryptedData, receivedEncryptedDataKey]) => {
                    expect(receivedEncryptedData).to.deep.equal(encryptionResources.encryptedData);
                    expect(receivedEncryptedDataKey)
                        .to.equal(encryptionResources.encryptedDataKey);

                    // common key
                    expect(getCommonKeyStub).to.be.calledOnce;
                    expect(getCommonKeyStub)
                        .to.be.calledWith(encryptionResources.clientID, encryptionResources.userID);
                    expect(asymDecryptStringStub).to.be.calledOnce;
                    expect(asymDecryptStringStub).to.be.calledWith(
                        encryptionResources.privateClientUserJWK,
                        encryptionResources.encryptedCommonKeyJWK);
                    // encryption
                    expect(symEncryptStub).to.be.calledOnce;
                    expect(symEncryptStub)
                        .to.be.calledWith(encryptionResources.dataKey, encryptionResources.data);
                    expect(symEncryptStub).to.be.calledOnce;
                    expect(symEncryptObjectStub)
                        .to.be.calledWith(
                            encryptionResources.commonKey,
                            encryptionResources.dataKey);

                    done();
                })
                .catch(done);
        });
    });

    describe('decryptData', () => {
        let decryptData;
        beforeEach(() => {
            decryptData = createCryptoService(
                encryptionResources.clientID)(
                encryptionResources.privateClientUserJWK)(
                encryptionResources.userID)
                .decryptData;
        });

        it('should be possible to decrypt document', (done) => {
            decryptData(encryptionResources.encryptedDataKey, encryptionResources.encryptedData)
                .then((receivedData) => {
                    expect(receivedData).to.be.equal(encryptionResources.data);

                    // common key
                    expect(getCommonKeyStub).to.be.calledOnce;
                    expect(getCommonKeyStub)
                        .to.be.calledWith(encryptionResources.clientID, encryptionResources.userID);
                    expect(asymDecryptStringStub).to.be.calledOnce;
                    expect(asymDecryptStringStub).to.be.calledWith(
                        encryptionResources.privateClientUserJWK,
                        encryptionResources.encryptedCommonKeyJWK);
                    // decryption
                    expect(symDecryptStringStub).to.be.calledOnce;
                    expect(symDecryptStringStub)
                        .to.be.calledWith(
                            encryptionResources.commonKey,
                            encryptionResources.encryptedDataKey);
                    expect(symDecryptStub).to.be.calledOnce;
                    expect(symDecryptStub)
                        .to.be.calledWith(
                            encryptionResources.dataKey,
                            encryptionResources.encryptedData);
                })
                .then(() => done())
                .catch(done);
        });
    });

    afterEach(() => {
    });
});
