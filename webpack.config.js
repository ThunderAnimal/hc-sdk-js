var webpack = require('webpack');

module.exports = {

	entry: __dirname + '/src/index.js',

	output: {
		filename: 'healthcloud-sdk.js',
		path: __dirname + '/dist'
	},

	plugins: [
		new webpack.optimize.OccurrenceOrderPlugin()
	]

};