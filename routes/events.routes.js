/**
 *
 * Rutas de eventos
 *
 * host + /api/events (GET)
 * host + /api/events/getByDay?day=DAY_ID (GET)
 * host + /api/events/getBySlug?slug=DAY_SLUG (GET)
 * host + /api/events/create (POST)
 * host + /api/events/:id (PUT)
 * host + /api/events/:id (DELETE)
 *
 */

const { Router } = require("express");
const { check } = require("express-validator");

const router = Router();

const { validateJWT } = require("../middlewares/validate-jwt");
const {
  findOne,
  findByCategory,
  create,
  update,
  remove,
  uploadExcel,
} = require("../controllers/events");
const { validateFields } = require("../middlewares");
const upload = require("../helpers/uploadExcel");
const { checkIdEvent } = require("../helpers/dbValidators");

const validationsToCreate = [
  check("name", "El nombre del evento (name) es requerido.").not().isEmpty(),
  check("description", "La descripción (description) es requerida.")
    .not()
    .isEmpty(),
  check("slug", "El slug requerido.").not().isEmpty(),
  check("day").not().isEmpty().isMongoId(),
  validateFields,
];

// Todas las rutas deben validar el token
router.use(validateJWT);

router.get(
  "/:id",
  [
    check("id", "El id debe de ser de mongo").isMongoId(),
    check("id").custom(checkIdEvent),
    validateFields,
  ],
  findOne
);
router.get("/category/:slug", findByCategory);
router.post("/", validationsToCreate, create);
router.put(
  "/:id",
  [
    check("id", "El id debe de ser de mongo").isMongoId(),
    check("id").custom(checkIdEvent),
    validateFields,
  ],
  update
);
router.delete(
  "/:id",
  [
    check("id", "El id debe de ser de mongo").isMongoId(),
    check("id").custom(checkIdEvent),
    validateFields,
  ],
  remove
);
router.post("/excel", uploadExcel);
// router.post("/excel", upload.single("excel", 12), uploadExcel);

module.exports = router;
