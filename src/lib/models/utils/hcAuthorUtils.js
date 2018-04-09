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

const hcAuthorUtils = {
    fromFhirObject(fhirObject) {
        const options = {
            identifier: fhirObject.identifier && fhirObject.identifier[0] ?
                fhirObject.identifier[0].value : undefined,
        };

        if (fhirObject.name && fhirObject.name[0]) {
            const name = fhirObject.name[0];
            options.firstName = name.given && name.given[0] ? name.given[0] : undefined;
            options.lastName = name.family;
            options.prefix = name.prefix && name.prefix[0] ? name.prefix[0] : undefined;
            options.suffix = name.suffix && name.suffix[0] ? name.suffix[0] : undefined;
        }
        if (fhirObject.address && fhirObject.address.length > 0) {
            const address = fhirObject.address[0];
            options.street = address.line && address.line[0] ? address.line[0] : undefined;
            options.city = address.city;
            options.postalCode = address.postalCode;
        }
        if (fhirObject.telecom) {
            const telephone = fhirObject.telecom.find(el => el.value === 'phone');
            options.telephone = telephone ? telephone.value : undefined;
            const website = fhirObject.telecom.find(el => el.value === 'url');
            options.website = website ? website.value : undefined;
        }
        return new HCAuthor(options);
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
