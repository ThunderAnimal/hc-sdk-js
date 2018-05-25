/* eslint-disable complexity */
import ValidationError from '../errors/ValidationError';

class HCAuthor {
    constructor({
        id,
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
        if (!((typeof id === 'string' || !id)
                && (typeof firstName === 'string' || !firstName)
                && (typeof lastName === 'string' || !lastName)
                && (typeof prefix === 'string' || !prefix)
                && (typeof suffix === 'string' || !suffix)
                && (typeof street === 'string' || !street)
                && (typeof city === 'string' || !city)
                && (typeof postalCode === 'string' || !postalCode)
                && (typeof telephone === 'string' || !telephone)
                && (typeof website === 'string' || !website)
                && (typeof specialty === 'string' || !specialty))) {
            throw new ValidationError('HCAuthor: Invalid arguments');
        }
        this.id = id;
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
