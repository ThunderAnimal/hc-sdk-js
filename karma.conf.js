// Karma configuration
// Generated on Thu Aug 03 2017 11:17:07 GMT+0200 (CEST)

module.exports = function (config) {
	const configuration = {

		// list of files / patterns to load in the browser
		files: [
			'src/**/*.js',
			'test/**/*.js',
		],

		preprocessors: {
			'src/**/*.js': ['browserify'],
			'test/**/*.js': ['browserify'],
		},

		browserify: {
			debug: true,
			plugin: ['proxyquire-universal'],
			transform: [
				['babelify', { presets: ['es2015'] }],
				['aliasify', {
					aliases: {
						config: './src/config/develop',
					},
				}],
			],
		},

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: [
			'mocha',
			'chai',
			'sinon',
			'sinon-stub-promise',
			'browserify',
		],

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['mocha', 'coverage'],

		coverageReporter: {
			reporters: [{ type: 'lcov' }],
		},

		customLaunchers: {
			Chrome_travis_ci: {
				base: 'Chrome',
				flags: ['--no-sandbox'],
			},
		},

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['Chrome'],
	};

	if (process.env.TRAVIS) {
		configuration.browsers = ['Chrome_travis_ci'];
		configuration.browserify.transform.push(
			['browserify-babel-istanbul', { ignore: ['**/node_modules/**', '**/tests/**'] }]);
	}

	config.set(configuration);
};
