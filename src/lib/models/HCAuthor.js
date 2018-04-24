/* eslint-disable complexity */
import ValidationError from '../errors/ValidationError';

class HCAuthor {
    constructor({
        identifier,
        firstName,
        lastName,
        prefix,
        suffix,
        street,
        city,
        postalCode,
        telephone,
        website,
        specialty,
    } = {}) {
        if (!((typeof identifier === 'string' || !identifier)
                && (typeof firstName === 'string' || !firstName)
                && (typeof lastName === 'string' || !lastName)
                && (typeof prefix === 'string' || !prefix)
                && (typeof suffix === 'string' || !suffix)
                && (typeof street === 'string' || !street)
                && (typeof city === 'string' || !city)
                && (typeof postalCode === 'string' || !postalCode)
                && (typeof telephone === 'string' || !telephone)
                && (typeof website === 'string' || !website)
                && (typeof specialty === 'number' || !specialty))) {
            throw new ValidationError('HCAuthor: Invalid arguments');
        }
        this.identifier = identifier;
        this.firstName = firstName;
        this.lastName = lastName;
        this.prefix = prefix;
        this.suffix = suffix;
        this.street = street;
        this.city = city;
        this.postalCode = postalCode;
        this.telephone = telephone;
        this.website = website;
        this.specialty = specialty;
    }
}

export default HCAuthor;
