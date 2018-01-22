const environmentUtils = {
    getLocalStorage() {
        return window && window.localStorage ? window.localStorage : undefined;
    },
};

export default environmentUtils;
