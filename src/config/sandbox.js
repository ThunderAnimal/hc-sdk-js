const config = {
  api: "https://sandbox.hpihc.de",
  // TODO: need to change to internal url once deployed.
  fhirSchemaUrl:
    "https://raw.githubusercontent.com/harsimran1/fhir-validator-js" +
    "/master/lib/conformance/3.0.1/schema.json",
  encryption: {
    iv: "Grrn3gR2ma/thJRloN+PeA==",
    keySize: 128
  },
  signinState: "pkyyf",
  zkit: {
    service_url: "https://g6y0wg1tf6.api.tresorit.io",
    clientId: "g6y0wg1tf6_RGxRknA5dI",
    version: 4
  }
};

export default config;
