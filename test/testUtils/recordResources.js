import testVariables from "./testVariables";
import fhirResources from "./fhirResources";

const recordResources = {
  count: 1,
  documentReference: {
    record_id: testVariables.recordId,
    date: testVariables.dateString,
    user_id: testVariables.userId,
    version: 2,
    status: "Active",
    createdAt: testVariables.dateTimeString,
    body: fhirResources.documentReferenceUploaded,
    tags: [testVariables.tag]
  },
  documentReferenceEncrypted: {
    record_id: testVariables.recordId,
    date: testVariables.dateString,
    user_id: testVariables.userId,
    version: 2,
    status: "Active",
    createdAt: testVariables.dateTimeString,
    encrypted_body: fhirResources.encryptedFhir,
    encrypted_tags: [testVariables.encryptedTag]
  }
};

export default recordResources;
