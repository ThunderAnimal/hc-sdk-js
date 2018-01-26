const sessionHandler = {
  localStorage: new Map(),

  getItem(key) {
    return this.localStorage.get(key);
  },
  setItem(key, value) {
    this.localStorage.set(key, value);
  },
  removeItem(key) {
    this.localStorage.delete(key);
  },
  logout() {
    this.localStorage.clear();
  }
};

export default sessionHandler;
