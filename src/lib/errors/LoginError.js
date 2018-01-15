export default class LoginError {
    constructor(message) {
        this.name = 'LoginError';
        this.message = message || '';
    }
}

export const NOT_LOGGED_IN = 'no logged in user';
