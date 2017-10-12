import CryptoJS from 'crypto-js';
import config from '../config';

class EncryptionUtils {
	constructor() {
		this.keySize = config.encryption.keySize;
		this.iv = config.encryption.iv;
	}

	generateKey() {
		const key = CryptoJS.lib.WordArray.random(this.keySize / 8);
		return CryptoJS.enc.Base64.stringify(key);
	}

	encrypt(plainText, key) {
		const encrypted = CryptoJS.AES.encrypt(
			plainText,
			CryptoJS.enc.Base64.parse(key),
			{ iv: CryptoJS.enc.Base64.parse(this.iv) });
		return encrypted.toString();
	}

	decrypt(cipherText, key) {
		const decrypted = CryptoJS.AES.decrypt(
			cipherText,
			CryptoJS.enc.Base64.parse(key),
			{ iv: CryptoJS.enc.Base64.parse(this.iv) });
		return decrypted.toString(CryptoJS.enc.Utf8);
	}
}

export default new EncryptionUtils();
