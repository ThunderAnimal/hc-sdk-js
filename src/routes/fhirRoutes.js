import config from '../config';
import hcRequest from '../lib/hcRequest';

const fhirSchemaUrl = config.fhirSchemaUrl;

const fhir = {
	getFhirSchema() {
		return hcRequest('GET', fhirSchemaUrl);
	},
};

export default fhir;
