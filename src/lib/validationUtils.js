/* eslint-disable no-useless-escape */
const emailRegex = /^[a-zA-Z0-9_\-.]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-.]+$/;


const validationUtils = {

	validateEmail(email) {
		return emailRegex.test(email);
	},

};

export default validationUtils;
