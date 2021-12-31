const { Router } = require("express");
const router = Router();

const { strava, stravaWebhook } = require("../controllers/strava");
router.get("/webhook", strava);
router.post("/webhook", stravaWebhook);

module.exports = router;
