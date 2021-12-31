/**
 *
 * Rutas de días de fiesta
 *
 * host + /api/days (GET)
 * host + /api/days/:id (GET)
 * host + /api/days/create (POST)
 * host + /api/days/:id (PUT)
 * host + /api/days/:id (DELETE)
 *
 */

const { Router } = require("express");
const { check } = require("express-validator");
const router = Router();

const { validateJWT, hasRole, validateFields } = require("../middlewares/");

const {
  findAll,
  findOne,
  findEvents,
  create,
  update,
  remove,
} = require("../controllers/days");
const { checkIdDay } = require("../helpers/dbValidators");

const validationsToCreate = [
  check("date", "La fecha (date) es requerida.").not().isEmpty(),
  check("title_seo", "El título para seo (title_seo) es requerido.")
    .not()
    .isEmpty(),
  check("description", "La descripción (description) es requerida.")
    .not()
    .isEmpty(),
  check("slug", "El slug es requerido").not().isEmpty(),
  validateFields,
];

// Todas las rutas deben validar el token
router.use(validateJWT);

router.get("/", findAll);
router.get(
  "/:id",
  [
    check("id", "El id debe de ser de mongo").isMongoId(),
    check("id").custom(checkIdDay),
    validateFields,
  ],
  findOne
);
router.get("/:id/events", findEvents);
router.post("/", validationsToCreate, create);
router.put(
  "/:id",
  [
    hasRole("ADMIN_ROLE"),
    check("id", "El id no es válido").isMongoId(),
    check("id").custom(checkIdDay),
    validateFields,
  ],
  update
);
router.delete("/:id", remove);

module.exports = router;
