const webpack = require('webpack');
const path = require('path');

module.exports = (env) => {
	const config = {
		entry: `${__dirname}/src/HealthCloud.js`,
		devtool: 'source-map',
		target: env.TARGET,
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
		resolve: {
			alias: {
				config: path.resolve(__dirname, `src/config/${env.NODE_ENV}.js`),
				'session-handler': path.resolve(__dirname, `src/lib/sessionHandler/${env.TARGET}.js`),
			},
		},
		plugins: [
			new webpack.DefinePlugin({
				'global.GENTLY': env.TARGET !== 'node',
				NODE: env.TARGET === 'node',
			}),
		],

	};
	return config;
};
