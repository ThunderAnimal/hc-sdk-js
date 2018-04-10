export default class SetupError {
    constructor(message) {
        this.name = 'SetupError';
        this.message = message || '';
    }
}

export const NOT_SETUP = 'the sdk was not setup correctly';
