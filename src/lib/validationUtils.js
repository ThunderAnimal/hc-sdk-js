/* eslint-disable no-useless-escape */
// https://github.com/asaskevich/govalidator/blob/v8/patterns.go#L7
import ValidationError from './errors/ValidationError';

// eslint-disable-next-line max-len
const emailRegex = /^((([a-zA-Z]|\d|[!#$%&'*+\-\/=?^_`{|}~]|[\u{00A0}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFEF}])+(\.([a-zA-Z]|\d|[!#$%&'*+\-\/=?^_`{|}~]|[\u{00A0}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFEF}])+)*)|((\u{22})((([\u{20}\u{09}]*(\u{0d}\u{0a}))?[\u{20}\u{09}]+)?(([\u{01}-\u{08}\u{0b}\u{0c}\u{0e}-\u{1f}\u{7f}]|\u{21}|[\u{23}-\u{5b}]|[\u{5d}-\u{7e}]|[\u{00A0}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFEF}])|(\([\u{01}-\u{09}\u{0b}\u{0c}\u{0d}-\u{7f}]|[\u{00A0}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFEF}]))))*(([\u{20}\u{09}]*(\u{0d}\u{0a}))?[\u{20}\u{09}]+)?(\u{22}))@((([a-zA-Z]|\d|[\u{00A0}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFEF}])|(([a-zA-Z]|\d|[\u{00A0}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFEF}])([a-zA-Z]|\d|-|\.|_|~|[\u{00A0}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFEF}])*([a-zA-Z]|\d|[\u{00A0}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFEF}])))\.)+(([a-zA-Z]|[\u{00A0}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFEF}])|(([a-zA-Z]|[\u{00A0}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFEF}])([a-zA-Z]|\d|-|_|~|[\u{00A0}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFEF}])*([a-zA-Z]|[\u{00A0}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFEF}])))\.?$/ui;

const ensureArrayIfExists = (value, propertyName) => {
    if (!value) return undefined;
    if (!(Array.isArray(value))) {
        throw new ValidationError(`Property: ${propertyName} must be Array`);
    }
    return value;
};

const ensureDateIfExists = (value, propertyName) => {
    if (!value || value instanceof Date) {
        return value;
    }
    try {
        if (typeof value !== 'string') throw new Error();
        return new Date(value);
    } catch (err) {
        throw new ValidationError(`Property: ${propertyName} must be Date or a valid Date string representation`);
    }
};

const validateEmail = email => emailRegex.test(email);

export {
    ensureArrayIfExists,
    ensureDateIfExists,
    validateEmail,
};
