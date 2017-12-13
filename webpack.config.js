const webpack = require('webpack');
const path = require('path');

module.exports = (env) => {
	const config = {
		entry: `${__dirname}/src/HealthCloud.js`,
		devtool: 'source-map',
		output: {
			path: `${__dirname}/../hc-terra/public/lib`,
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
		resolve: {
			alias: {
				config: path.resolve(__dirname, `src/config/${env.NODE_ENV}.js`),
			},
		},
	};
	return config;
};
