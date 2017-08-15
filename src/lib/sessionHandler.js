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
};

export default SessionHandler;
