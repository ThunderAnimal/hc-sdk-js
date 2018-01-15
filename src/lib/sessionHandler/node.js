const sessionHandler = {
    localStorage: new Map(),

    get(name) {
        return this.localStorage.get(name);
    },
    set(name, val) {
        this.localStorage.set(name, val);
    },
    deleteCookie(name) {
        this.localStorage.delete(name);
    },
    logout() {
        this.localStorage.clear();
    },
};

export default sessionHandler;
