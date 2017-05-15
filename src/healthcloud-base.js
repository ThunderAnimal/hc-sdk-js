let HealthCloudBase;

HealthCloudBase = function (options) {
	options = options || {};
	this.accessToken = options.accessToken;
	this.clientId = options.clientId;
	this.selectUser = options.selectUser;
};


HealthCloudBase.prototype.request = function (string) {
	console.log(string);
};

module.exports = HealthCloudBase;
