const fieldValidators = require("../middlewares/field-validators");
const validateJwt = require("../middlewares/validate-jwt");
const validateFile = require("../middlewares/validate-file");
const validateRoles = require("../middlewares/validate-roles");

module.exports = {
  ...fieldValidators,
  ...validateJwt,
  ...validateFile,
  ...validateRoles,
};
