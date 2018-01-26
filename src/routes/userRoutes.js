import config from "config";
import hcRequest from "../lib/hcRequest";

const apiUrl = config.api;

const userRoutes = {
  initRegistration(hcUserAlias) {
    const body = { email: hcUserAlias };

    return hcRequest("POST", `${apiUrl}/users/register/init`, { body });
  },

  validateRegistration(validationVerifier, zerokitId) {
    const body = {
      validation_verifier: validationVerifier,
      zerokit_id: zerokitId
    };

    return hcRequest("POST", `${apiUrl}/users/register/finish`, { body });
  },

  resolveUserId(hcUserAlias) {
    const body = { value: hcUserAlias };

    return hcRequest("POST", `${apiUrl}/users/resolve`, { body });
  },

  getUserDetails(userId) {
    return hcRequest("GET", `${apiUrl}/users/${userId}`, { authorize: true });
  },

  getGrantedPermissions(userId, granteeId) {
    return hcRequest("GET", `${apiUrl}/users/${userId}/permissions`, {
      authorize: true,
      query: { grantee_id: granteeId }
    });
  },

  addTresor(userId, tresorId) {
    const body = { user_id: userId, tresor_id: tresorId };

    return hcRequest("POST", `${apiUrl}/tresors`, { body, authorize: true });
  },

  verifyShareAndGrantPermission(ownerId, granteeId, OperationId) {
    const body = { grantee_id: granteeId, operation_id: OperationId };

    return hcRequest("POST", `${apiUrl}/users/${ownerId}/permissions`, {
      body,
      authorize: true
    });
  },

  addTagEncryptionKey(userId, secret) {
    const body = { tek: secret };

    return hcRequest("POST", `${apiUrl}/users/${userId}/tek`, {
      body,
      authorize: true
    });
  },

  updateUser(userId, userData) {
    return hcRequest("PUT", `${apiUrl}/users/${userId}`, {
      body: userData,
      authorize: true
    });
  }
};

export default userRoutes;
