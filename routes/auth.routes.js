/**
 *
 * Rutas de auth
 *
 * host + /api/auth/create (POST)
 * host + /api/auth (POST)
 * host + /api/auth/renew (GET)
 * host + /api/auth/me (GET)
 *
 */

const { Router } = require("express");
const { check } = require("express-validator");
const router = Router();

const {
  strava,
  stravaWebhook,
  // createUser,
  // loginUser,
  // renewToken,
  // me,
} = require("../controllers/auth");
// const { validateFields } = require("../middlewares/field-validators");
// const { validateJWT } = require("../middlewares/validate-jwt");

// router.post(
//   "/create",
//   [
//     check("name", "Nombre obligatorio").not().isEmpty(),
//     check("email", "Email obligatorio o no válido").isEmail(),
//     check("password", "La contraseña debe tener más de 6 caracteres").isLength({
//       min: 6,
//     }),
//     validateFields,
//   ],
//   createUser
// );

// router.post(
//   "/",
//   [
//     check("email", "Email obligatorio o no válido").isEmail(),
//     check("password", "La contraseña debe tener más de 6 caracteres").isLength({
//       min: 6,
//     }),
//     validateFields,
//   ],
//   loginUser
// );
// router.get("/strava", strava);
// router.post("/strava", stravaWebhook);
// router.get("/renew", validateJWT, renewToken);

module.exports = router;
