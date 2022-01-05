/**
 *
 * Rutas de users
 *
 * host + /api/users (GET)
 * host + /api/users/new (POST)
 * host + /api/users/:id (PUT)
 * host + /api/users/:id (DELETE)
 *
 */

const { Router } = require("express");
const router = Router();

const { validateJWT } = require("../middlewares/validate-jwt");
const { getUsers, findOne, updateUser } = require("../controllers/users");
const { check } = require("express-validator");
const { validateFields } = require("../middlewares/field-validators");
const { create, myLeagues } = require("../controllers/users");

// Todas las rutas deben validar el token
// router.use(validateJWT);

router.post("/", [], create);
router.get("/:userId/leagues", myLeagues);

// router.get("/", getUsers);
// router.get("/:id", findOne);
// router.patch(
//   "/:id",
//   [
//     check("role", "El role es requerido.").not().isEmpty(),
//     check("email", "El email es requerido y debe ser válido.")
//       .not()
//       .isEmpty()
//       .isEmail(),
//     check("name", "El nombre es requerido.").not().isEmpty(),
//     validateFields,
//   ],
//   updateUser
// );

module.exports = router;
