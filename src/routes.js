let routes = {};

routes.printHelloWorld = function () {
	this.request('Hello World');
};

module.exports = routes;
