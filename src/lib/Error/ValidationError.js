export default class ValidationError {
	constructor(message) {
		this.name = 'ValidationError';
		this.message = message || '';
	}
}

export const MISSING_PARAMETERS = 'no passed parameters';
export const INVALID_PARAMETERS = 'invalid parameters';
