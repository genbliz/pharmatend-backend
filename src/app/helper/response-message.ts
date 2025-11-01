export const ResponseMessage = {
  internalServerError: "Error occured in the server...",
  tenantCacheDataNotFound: "Administrator is required to login to re-enable app usage.",
  tenantIdUndefined: "Tenant Id parameter not defined...",
  dataIdUndefined: "Id parameter not defined...",
  currentUserDataNotFound: "You must login. Current User Data NOT Found...",
  userNotFound: "User NOT Found...",
  wrongPassword: "Wrong Password",
  requiredParameterUndefined: "Required parameter(s) not defined...",
  patientIdParameterUndefined: "Patient ID parameter not defined...",
  patientIdFormDataUndefined: "Patient ID form data not defined...",
  userIdParameterNotFound: "User Id parameter not found",
  empty: null,
  notFound: "Not Found...",
  badRequest: "Bad Request",
  roleMisMatch: "You do not have the priviledge of access",
  onlyAdminRoleAllowed: "You do not have the priviledge of access. Only admin can access.",
  patientNumberAlreadyExists: "Patient Number already exists...",
  wrongDataFormat: "wrong Data Format",
  authenticationFailedUserNotFound: "Authentication failed. User not found.",
  tenantHasNoValidLicense: "Tenant has no valid license",
};

export function isMessageInResponseMessageList(message: unknown) {
  if (message && typeof message === "string") {
    return Object.entries(ResponseMessage).some(([_, value]) => {
      return value === message;
    });
  }
  return false;
}
