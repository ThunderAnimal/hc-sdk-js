// noinspection JSAnnotator
const SessionHandler = {

	get(key) {
		return this.getCookie(key);
	},

	set(key, value) {
		document.cookie = `${key}=${value};path=/`;
	},

	getCookie(cookie) {
		let Cookie;
		const pattern = RegExp(`${cookie}=.[^;]*`);
		const matched = document.cookie.match(pattern);

		if (matched) {
			Cookie = matched[0].split('=');
			return Cookie[1];
		}
		return undefined;
	},

	deleteCookie(name) {
		document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
	},

	logout() {
		this.deleteCookie('HC_Id');
		this.deleteCookie('HC_Auth');
		this.deleteCookie('HC_User');
		this.deleteCookie('HC_Refresh');
	},
};

export default SessionHandler;
