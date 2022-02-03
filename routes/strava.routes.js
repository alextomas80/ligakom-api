const { Router } = require("express");
const router = Router();

const {
  strava,
  stravaWebhook,
  queueProcess,
  queueProcessEfforts,
} = require("../controllers/strava");

router.get("/webhook", strava);
router.get("/queue", queueProcess);
router.get("/queueEfforts", queueProcessEfforts);
router.post("/webhook", [], stravaWebhook);

module.exports = router;
