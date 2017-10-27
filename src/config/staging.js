const config = {
	api: 'https://staging.hpihc.de',
	// TODO: need to change to internal url once deployed.
	fhirSchemaUrl: 'https://raw.githubusercontent.com/arrian/fhir-validator-js' +
	'/master/lib/conformance/3.0.0/schema.json',
	encryption: {
		iv: 'Grrn3gR2ma/thJRloN+PeA==',
		keySize: 128,
	},
	signinState: 'pkyyf',
	zkit: {
		service_url: 'https://raf1unp2me.api.tresorit.io',
		clientId: 'raf1unp2me_qQ1dMytsop',
	},
};

export default config;
