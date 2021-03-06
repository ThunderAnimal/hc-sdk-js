const webpack = require('webpack');
const path = require('path');
const packageJson = require('./package.json');

module.exports = (env) => {
    const config = {
        entry: `${__dirname}/src/healthCloud.js`,
        devtool: 'source-map',
        target: env.TARGET,
        output: {
            path: `${__dirname}/dest`,
            filename: 'healthcloud_sdk.js',
            library: 'GC',
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
        plugins: [
            new webpack.DefinePlugin({
                'global.GENTLY': env.TARGET !== 'node',
                NODE: env.TARGET === 'node',
                VERSION: JSON.stringify(packageJson.version),
            }),
            new webpack.BannerPlugin(`Version: ${JSON.stringify(packageJson.version)}`),
        ],
    };
    if (env.MINIFY) {
        config.plugins.push(new webpack.optimize.UglifyJsPlugin());
    }

    return config;
};
