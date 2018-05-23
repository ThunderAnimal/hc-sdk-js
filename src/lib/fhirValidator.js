import Ajv from 'ajv';

import ValidationError from './errors/ValidationError';
import fhirSchema from '../assets/fhir_schema.json';

const ajv = new Ajv({ extendRefs: true });

class FhirValidator {
    getConformance() {
        return new Promise((resolve) => {
            if (this.conformance) {
                resolve(this.conformance);
                return;
            }

            Object.keys(fhirSchema.resources).forEach((key) => {
                fhirSchema.resources[key].types = Object.assign({},
                    fhirSchema.resources[key].types, fhirSchema.types);
            });
            this.conformance = {
                types: fhirSchema.types,
                resources: fhirSchema.resources,
            };
            resolve(this.conformance);
        });
    }

    isValidResourceType(resourceType) {
        return new Promise((resolve, reject) => {
            this.getConformance()
                .then((conform) => {
                    if (Object.prototype.hasOwnProperty
                        .call(conform.resources, resourceType)) resolve(true);
                    else reject(false);
                })
                .catch(reject);
        });
    }

    validate(data) {
        return new Promise((resolve, reject) => {
            const resource = data;
            const errors = [];

            if (resource && resource.resourceType) {
                this.isValidResourceType(resource.resourceType)
                    .then(() => {
                        const validation = ajv
                            .compile(this.conformance.resources[resource.resourceType]);
                        validation(resource);
                        if (validation.errors) {
                            reject(errors.concat(validation.errors));
                        }
                        resolve(resource);
                    })
                    .catch(() => {
                        errors.push(new ValidationError('Not a valid resource type'));
                        reject(errors);
                    });
            } else {
                errors.push(new ValidationError('Not a valid resource type'));
                reject(errors);
            }
        });
    }
}

export default new FhirValidator();
