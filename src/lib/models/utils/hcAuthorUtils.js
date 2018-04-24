import HCAuthor from '../HCAuthor';
import hcSpecialtyUtils from './hcSpecialtyUtils';


export const schema = {
    type: 'object',
    properties: {
        identifier: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        prefix: { type: 'string' },
        suffix: { type: 'string' },
        street: { type: 'string' },
        city: { type: 'string' },
        postalCode: { type: 'string' },
        telephone: { type: 'string' },
        website: { type: 'string' },
        specialty: {
            type: 'number',
            enum: hcSpecialtyUtils.getSpecialties(),
        },
    },
    required: [],
};

const getIdentifier = (authorFhirObject) => {
    if (authorFhirObject.identifier && authorFhirObject.identifier[0]) {
        return authorFhirObject.identifier[0].value;
    }
    return undefined;
};

const hasName = authorFhirObject => authorFhirObject.name && authorFhirObject.name[0];
const getName = (authorFhirObject) => {
    if (hasName(authorFhirObject)) {
        return {
            firstName: name.given && name.given[0] ? name.given[0] : undefined,
            lastName: name.family,
            prefix: name.prefix && name.prefix[0] ? name.prefix[0] : undefined,
            suffix: name.suffix && name.suffix[0] ? name.suffix[0] : undefined,
        };
    }
    return {};
};
const hasAddress = authorFhirObject =>
    authorFhirObject.address && authorFhirObject.address.length > 0;
const getAddress = (authorFhirObject) => {
    if (hasAddress(authorFhirObject)) {
        const address = authorFhirObject.address[0];
        return {
            street: address.line && address.line[0] ? address.line[0] : undefined,
            city: address.city,
            postalCode: address.postalCode,
        };
    }
    return {};
};

const getTelecom = (authorFhirObject) => {
    if (authorFhirObject.telecom) {
        const phone = authorFhirObject.telecom.find(el => el.system === 'phone');
        const website = authorFhirObject.telecom.find(el => el.value === 'url');
        return {
            telephone: phone ? phone.value : undefined,
            website: website ? website.value : undefined,
        };
    }
    return {};
};

const hcAuthorUtils = {
    fromFhirObject(fhirObject) {
        return new HCAuthor({
            identifier: getIdentifier(fhirObject),
            ...getName(fhirObject),
            ...getAddress(fhirObject),
            ...getTelecom(fhirObject),
        });
    },

    toFhirObject(hcAuthor, clientId) {
        const fhirObject = {
            resourceType: 'Practitioner',
            id: 'contained-author-id',
            identifier: [
                {
                    value: hcAuthor.identifier,
                    assigner: {
                        reference: clientId,
                    },
                },
            ],
            name: [{
                family: hcAuthor.lastName,
                given: [hcAuthor.firstName],
                prefix: [hcAuthor.prefix],
                suffix: [hcAuthor.suffix],
            }],
            address: [{
                line: [hcAuthor.street],
                city: hcAuthor.city,
                postalCode: hcAuthor.postalCode,
            }],
            telecom: [],
        };

        if (hcAuthor.telephone) {
            fhirObject.telecom.push({
                system: 'phone',
                value: hcAuthor.telephone,
            });
        }

        if (hcAuthor.website) {
            fhirObject.telecom.push({
                system: 'url',
                value: hcAuthor.website,
            });
        }
        return fhirObject;
    },
};

export default hcAuthorUtils;
