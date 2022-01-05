/**
 *
 * [POST] /api/leagues - Crear nueva liga
 *
 */

const { Router } = require("express");
const router = Router();

const { check } = require("express-validator");

// const { validateJWT } = require("../middlewares/validate-jwt");
const { validateFields } = require("../middlewares/field-validators");
const { checkIdLeague } = require("../helpers/dbValidators");
const {
  addSegment,
  removeSegment,
  create,
  findOne,
  remove,
  update,
  findAll,
} = require("../controllers/leagues");

const validationsToCreate = [
  check("name", "Campo requerido (name).").not().isEmpty(),
  check("description", "Campo requerido (description).").not().isEmpty(),
  check("startDate", "Campo requerido (startDate)").not().isEmpty(),
  check("endDate", "Campo requerido (endDate)").not().isEmpty(),
  validateFields,
];

const validationsToUpdateOrRemove = [
  check("id", "💥 El id debe de ser de mongo").isMongoId(),
  check("id").custom(checkIdLeague),
  validateFields,
];

// Todas las rutas deben validar el token
// router.use(validateJWT);

router.get("/", findAll);
router.get("/:id", findOne);
router.post("/", validationsToCreate, create);
router.put("/:id", validationsToUpdateOrRemove, update);
router.delete("/:id", validationsToUpdateOrRemove, remove);
router.post("/:id/segment/:sid", [], addSegment);
router.delete("/:id/segment/:sid", [], removeSegment);

module.exports = router;
