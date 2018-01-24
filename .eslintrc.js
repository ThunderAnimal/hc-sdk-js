module.exports = {
    extends: ['eslint:recommended', 'airbnb-base'],
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: 8,
        sourceType: 'module',
    },
    plugins: [
        'import',
    ],
    rules: {
        indent: ['error', 4],
        'func-names': 'warn',
        'class-methods-use-this': 'error',
        'arrow-body-style': ['error', 'as-needed'],
        'object-curly-newline': ['error', { minProperties: 4, multiline: true, consistent: true }],
        'no-unused-vars': 'error',
        'newline-per-chained-call': ['error', { ignoreChainWithDepth: 3 }],
        'max-len': ['error', { code: 100, ignoreTemplateLiterals: true, ignoreStrings: true }],

        semi: 'error',
        'key-spacing': ['error', { beforeColon: false }],

        complexity: ['error', 15], // push down to 10
        'max-depth': ['error', 4],
        'max-nested-callbacks': ['error', 3],
        'no-console': 'warn',

        // will be switched to error next sprint (airbnb default is error)
        'no-param-reassign': ['warn'],
    },
    settings: {
        'import/resolver': {
            configurable: {
                config: './src/config/develop',
                'session-handler': './src/lib/sessionHandler/web',
            },
        },
    },
    env: {
        browser: true,
        node: true,
        es6: true,
    },
    globals: {
        zkit_sdk: true,
        NODE: true,
        __karma__: true,
        VERSION: true,
    },
};
