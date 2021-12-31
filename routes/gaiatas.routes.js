const { Router } = require("express");
const { check } = require("express-validator");

const { validateJWT, validateFields } = require("../middlewares/");

const {
  findAll,
  findOne,
  create,
  update,
  remove,
} = require("../controllers/gaiatas");
const { checkIdGaiata } = require("../helpers/dbValidators");

const router = Router();

const validationsCreate = [
  check("title", "El title es requerido.").not().isEmpty(),
  check("subtitle", "El subtitle es requerido.").not().isEmpty(),
  validateFields,
];

const validationsGetUpdate = [
  check("id", "El id no es válido").isMongoId(),
  check("id").custom(checkIdGaiata),
  validateFields,
];

router.use(validateJWT);

router.get("/", findAll);
router.get("/:id", validationsGetUpdate, findOne);
router.post("/", validationsCreate, create);
router.put("/:id", validationsGetUpdate, update);
router.delete("/:id", validationsGetUpdate, remove);

module.exports = router;
