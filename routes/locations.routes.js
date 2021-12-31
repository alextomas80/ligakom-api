/**
 *
 * Rutas de locations
 *
 * host + /api/locations (GET)
 * host + /api/locations/create (POST)
 * host + /api/locations/:id (PUT)
 * host + /api/locations/:id (DELETE)
 *
 */

const { Router } = require("express");
const router = Router();

const { validateJWT } = require("../middlewares/validate-jwt");
const {
  findAll,
  findOne,
  create,
  update,
  remove,
} = require("../controllers/locations");
const { check } = require("express-validator");
const { validateFields } = require("../middlewares/field-validators");

const validationsToCreate = [
  check("name", "El nombre es requerido.").not().isEmpty(),
  check("slug", "El slug es requerido.").not().isEmpty(),
  check("latitude", "La latitude es requerida.").not().isEmpty(),
  check("longitude", "La longitude es requerida.").not().isEmpty(),
  validateFields,
];

// Todas las rutas deben validar el token
router.use(validateJWT);

router.get("/", findAll);
router.get("/:id", findOne);
router.post("/", validationsToCreate, create);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
