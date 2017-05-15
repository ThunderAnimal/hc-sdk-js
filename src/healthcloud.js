let HealthCloudBase = require('./healthcloud-base');
let routes = require('./routes.js');

let HealthCloud;

HealthCloud = function (options) {
	HealthCloudBase.call(this, options);
};

HealthCloud.prototype = Object.create(HealthCloudBase.prototype);

HealthCloud.prototype.constructor = HealthCloud;


// Add the user endpoint methods to the prototype
HealthCloud.prototype = Object.assign(HealthCloud.prototype, routes);

module.exports = HealthCloud;
