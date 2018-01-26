import environmentUtils from "../environmentUtils";

const cookieStorage = {
  getItem(key) {
    const pattern = new RegExp(`${key}=.[^;]*`);
    const matched = document.cookie.match(pattern);

    if (matched) {
      return matched[0].split("=")[1];
    }
    return undefined;
  },

  setItem(key, value) {
    document.cookie = `${key}=${value};path=/`;
  },

  removeItem(key) {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }
};

const storage = environmentUtils.getLocalStorage() || cookieStorage;
const sessionHandler = {
  setItem: (key, value) => storage.setItem(key, value),
  getItem: key => storage.getItem(key),
  removeItem: key => storage.removeItem(key),
  logout: () => {
    storage.removeItem("HC_Id");
    storage.removeItem("HC_Auth");
    storage.removeItem("HC_User");
    storage.removeItem("HC_Refresh");
  }
};

export default sessionHandler;
