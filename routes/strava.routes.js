const { Router } = require("express");
const router = Router();

const {
  strava,
  stravaWebhook,
  queueProcess,
} = require("../controllers/strava");

router.get("/webhook", strava);
router.get("/queue", queueProcess);
router.post("/webhook", [], stravaWebhook);

module.exports = router;
