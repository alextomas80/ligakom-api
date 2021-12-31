/**
 *
 * Rutas de artículos
 *
 * host + /api/articles (GET)
 * host + /api/articles/:id (GET)
 * host + /api/articles/create (POST)
 * host + /api/articles/:id (PUT)
 * host + /api/articles/:id (DELETE)
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
  findOneById,
} = require("../controllers/articles");
const { check } = require("express-validator");
const { validateFields } = require("../middlewares/field-validators");

const validationsToCreate = [
  check("description", "description requerido.").not().isEmpty(),
  check("intro", "intro requerido.").not().isEmpty(),
  check("slug", "slug requerido").not().isEmpty(),
  check("title", "title requerido.").not().isEmpty(),
  validateFields,
];

// Todas las rutas deben validar el token
router.use(validateJWT);

router.get("/", findAll);
router.get("/:id", findOne);
// router.get("/detail/:slug", findOne);
router.post("/", validationsToCreate, create);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
