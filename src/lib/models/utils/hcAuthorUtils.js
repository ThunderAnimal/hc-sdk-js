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
            identifier: fhirObject.identifier && fhirObject.identifier.length > 0 ? fhirObject.identifier[0].value : '',
        };
        if (fhirObject.name && fhirObject.name.length > 0) {
            options.firstName = fhirObject.name[0].given ? fhirObject.name[0].given[0] : '';
            options.lastName = fhirObject.name[0].family;
            options.prefix = fhirObject.name[0].prefix ? fhirObject.name[0].prefix[0] : '';
            options.suffix = fhirObject.name[0].suffix ? fhirObject.name[0].suffix[0] : '';
        }
        if (fhirObject.address && fhirObject.address.length > 0) {
            options.street = fhirObject.address[0].line ? fhirObject.address[0].line[0] : '';
            options.city = fhirObject.address[0].city;
            options.postalCode = fhirObject.address[0].postalCode;
        }
        if (fhirObject.telecom) {
            const telephone = fhirObject.telecom.find(el => el.value === 'phone');
            options.telephone = telephone ? telephone.value : '';
            const website = fhirObject.telecom.find(el => el.value === 'url');
            options.website = website ? website.value : '';
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
