import CryptoJS from 'crypto-js';
import config from '../config';

class EncryptionUtils {
	constructor() {
		this.keySize = config.encryption.keySize;
		this.iv = config.encryption.iv;
	}

	generateKey() {
		const key = CryptoJS.lib.WordArray.random(this.keySize / 8);
		return key.toString();
	}

	encrypt(plainText, key) {
		const encrypted = CryptoJS.AES.encrypt(
			plainText,
			CryptoJS.enc.Hex.parse(key),
			{ iv: CryptoJS.enc.Hex.parse(this.iv) });
		return encrypted.toString();
	}

	decrypt(cipherText, key) {
		const cipherParams = CryptoJS.lib.CipherParams.create({
			ciphertext: CryptoJS.enc.Base64.parse(cipherText),
		});
		const decrypted = CryptoJS.AES.decrypt(
			cipherParams,
			CryptoJS.enc.Hex.parse(key),
			{ iv: CryptoJS.enc.Hex.parse(this.iv) });
		return decrypted.toString(CryptoJS.enc.Utf8);
	}
}

export default new EncryptionUtils();
