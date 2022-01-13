const { Router } = require("express");
const router = Router();

const {
  strava,
  stravaWebhook,
  getAndSaveSegments,
} = require("../controllers/strava");

router.get("/webhook", strava);
router.post("/webhook", [], stravaWebhook);
router.post("/segments/:array", [], getAndSaveSegments);

module.exports = router;
