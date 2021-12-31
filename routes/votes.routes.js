const { Router } = require("express");
const { check } = require("express-validator");

const { create } = require("../controllers/votes");
const { validateFields } = require("../middlewares");
const { validateJWT } = require("../middlewares/validate-jwt");

const router = Router();

const validations = [
  check("value", "El value es requerido.").not().isEmpty(),
  validateFields,
];

// router.use(validateJWT);

// router.get("/", findAll);
// router.get(
//   "/:id",
//   [
//     check("id", "El id debe de ser de mongo").isMongoId(),
//     check("id").custom(checkIdOcio),
//     validateFields,
//   ],
//   findOne
// );
// router.post("/:type/:idUser/:idVoted", validations, create);
// router.put(
//   "/:id",
//   [
//     check("id", "El id debe de ser de mongo").isMongoId(),
//     check("id").custom(checkIdOcio),
//     validateFields,
//   ],
//   update
// );
// router.delete(
//   "/:id",
//   [
//     check("id", "El id debe de ser de mongo").isMongoId(),
//     check("id").custom(checkIdOcio),
//     validateFields,
//   ],
//   remove
// );

module.exports = router;
