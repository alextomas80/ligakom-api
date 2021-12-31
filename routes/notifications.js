/**
 *
 * Rutas de notifications
 *
 * host + /api/notifications/send (POST)
 *
 */

const { Router } = require("express");
const router = Router();

const { send } = require("../controllers/notifications");

router.post("/send", send);

module.exports = router;
