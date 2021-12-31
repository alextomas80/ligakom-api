/**
 *
 * Rutas de categorías
 *
 * host + /api/categories (GET)
 * host + /api/categories/create (POST)
 * host + /api/categories/:id (PUT)
 * host + /api/categories/:id (DELETE)
 *
 */

const { Router } = require("express");
const router = Router();

const { validateJWT } = require("../middlewares/validate-jwt");
const { checkIdCategory } = require("../helpers/dbValidators");

const {
  findAll,
  findOne,
  create,
  update,
  remove,
} = require("../controllers/categories");
const { check } = require("express-validator");
const { validateFields } = require("../middlewares/field-validators");

const validationsToCreate = [
  check("name", "name requerido.").not().isEmpty(),
  check("slug", "slug requerido.").not().isEmpty(),
  check("id", "El id no es válido").isMongoId(),
  check("id").custom(checkIdCategory),
  validateFields,
];

// Todas las rutas deben validar el token
router.use(validateJWT);

router.get("/", findAll);
router.get("/:id", findOne);
router.post("/", validationsToCreate, create);
router.put(
  "/:id",
  check("id", "El id no es válido").isMongoId(),
  check("id").custom(checkIdCategory),
  validateFields,
  update
);
router.delete(
  "/:id",
  check("id", "El id no es válido").isMongoId(),
  check("id").custom(checkIdCategory),
  validateFields,
  remove
);

module.exports = router;
