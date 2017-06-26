class AbstractHealthCloud {

	constructor(options) {
		options = options || {};
		this.accessToken = options.accessToken;
		this.clientId = options.clientId;
	}
}

export default AbstractHealthCloud;
