// noinspection JSAnnotator
const SessionHandler = {

	get(name) {
		return this.getCookie(name);
	},

	getAuth() {
		return this.getCookie('HC_Auth');
	},

	getUser() {
		return this.getCookie('HC_User');
	},

	set(name, value) {
		document.cookie = `${name}=${value};path=/`;
	},

	remove(name) {
		document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
	},

	getCookie(cookie) {
		let Cookie;
		let pattern = RegExp(`${cookie}=.[^;]*`);
		let matched = document.cookie.match(pattern);
		if (matched) {
			Cookie = matched[0].split('=');
			return Cookie[1];
		}
		return undefined;
	},
};

export default SessionHandler;
