const { Router } = require("express");
const { check } = require("express-validator");

const { validateJWT, validateFields } = require("../middlewares/");
const { getSettings, setSettings } = require("../controllers/settings");

const router = Router();

const validations = [
  check("votingGaiatasMessage", "Campo 'votingGaiatasMessage' requerido.")
    .not()
    .isEmpty(),
  check("votingMascletaesMessage", "Campo 'votingMascletaesMessage' requerido.")
    .not()
    .isEmpty(),
  validateFields,
];

router.use(validateJWT);
router.get("/", getSettings);
router.put("/", validations, setSettings);

module.exports = router;
