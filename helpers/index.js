const dbValidators = require("./dbValidators");
const generateJWT = require("./jwt");

module.exports = {
  ...dbValidators,
  ...generateJWT,
};
