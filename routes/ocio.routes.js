/**
 *
 * Rutas de ocio
 *
 * host + /api/ocio (GET)
 *
 */

const { Router } = require("express");
const { check } = require("express-validator");

const router = Router();

const {
  findAll,
  findOne,
  update,
  create,
  remove,
} = require("../controllers/ocio");
const { validateFields } = require("../middlewares");
const { validateJWT } = require("../middlewares/validate-jwt");
const { checkIdOcio } = require("../helpers/dbValidators");

const validationsToCreate = [
  check("name", "El nombre es requerido.").not().isEmpty(),
  check("description", "La descripción es requerida.").not().isEmpty(),
  check("slug", "El slug requerido.").not().isEmpty(),
  check("latitude", "El slug requerido.").not().isEmpty(),
  check("longitude", "El slug requerido.").not().isEmpty(),
  check("category").not().isEmpty().isMongoId(),
  validateFields,
];

// Todas las rutas deben validar el token
router.use(validateJWT);

router.get("/", findAll);
router.get(
  "/:id",
  [
    check("id", "El id debe de ser de mongo").isMongoId(),
    check("id").custom(checkIdOcio),
    validateFields,
  ],
  findOne
);
router.post("/", validationsToCreate, create);
router.put(
  "/:id",
  [
    check("id", "El id debe de ser de mongo").isMongoId(),
    check("id").custom(checkIdOcio),
    validateFields,
  ],
  update
);
router.delete(
  "/:id",
  [
    check("id", "El id debe de ser de mongo").isMongoId(),
    check("id").custom(checkIdOcio),
    validateFields,
  ],
  remove
);

module.exports = router;
