const { response } = require("express");

const strava = async (req, res = response) => {
  const VERIFY_TOKEN = "LIGAKOM";

  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  console.log(req.query);

  if (!mode || !token)
    return res.status(500).send("Hubo un problema con el webhook");
  if (mode !== "subscribe") return res.sendStatus(403);
  if (token !== VERIFY_TOKEN) return res.status(403).send("Token no válido");

  console.log("WEBHOOK_VERIFIED ✅");
  return res.json({ "hub.challenge": challenge });
};

const stravaWebhook = async (req, res = response) => {
  console.log("🚀 🚀 🚀 webhook event received!");
  console.log(req.body);
  return res.status(200).send("EVENT_RECEIVED");
};

module.exports = { strava, stravaWebhook };
