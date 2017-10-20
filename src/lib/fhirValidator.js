import Ajv from 'ajv';

import ValidationError from './errors';
import fhirRoutes from '../routes/fhirRoutes';

const ajv = new Ajv({ extendRefs: true });

class Fhir {
	getConformance() {
		return new Promise((resolve, reject) => {
			if (this.conformance) {
				resolve(this.conformance);
				return;
			}
			fhirRoutes.getFhirSchema()
				.then((res) => {
					const schema = JSON.parse(res);
					Object.keys(schema.resources).forEach((key) => {
						schema.resources[key].types = Object.assign({},
							schema.resources[key].types, schema.types);
					});
					this.conformance = {
						types: schema.types,
						resources: schema.resources,
					};
					resolve(this.conformance);
				})
				.catch(reject);
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

export default new Fhir();
