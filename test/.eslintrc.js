module.exports = {
    settings: {
        'import/resolver': {
            configurable: {
                config: '../src/config/develop',
                'session-handler': '../src/lib/sessionHandler/web',
            },
        },
    },
    env: {
        mocha: true,
    },
};
