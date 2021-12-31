const { response } = require("express");

const strava = async (req, res = response) => {
  const VERIFY_TOKEN = "LIGAKOM";

  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Verifies that the mode and token sent are valid
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.json({ "hub.challenge": challenge });
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  } else {
    return res.sendStatus(500);
  }
};

const stravaWebhook = async (req, res = response) => {
  console.log("🚀 🚀 🚀 webhook event received!");
  console.log(req.body);
  return res.status(200).send("EVENT_RECEIVED");
};

module.exports = { strava, stravaWebhook };
