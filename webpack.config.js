let webpack = require('webpack');
let path = require('path');


let config = {
	entry: `${__dirname}/src/HealthCloud.js`,
	devtool: 'source-map',
	output: {
		path: `${__dirname}/dest`,
		filename: 'healthcloud_sdk.js',
		library: 'healthcloud_sdk',
		libraryTarget: 'umd',
		umdNamedDefine: true,
	},
	module: {
		loaders: [{
			test: /.js$/,
			loader: 'babel-loader',
		}],
	},
};

module.exports = config;
