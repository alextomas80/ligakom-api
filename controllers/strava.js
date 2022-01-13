const { response, request } = require("express");
const formatEffort = require("../helpers/formatEffort");

const { Segment, User, League } = require("../models");
const {
  getSegmentInformation,
  refreshToken,
  getSegmentEfforts,
} = require("../services/strava");
const supabase = require("../services/supabase");

const strava = (req, res = response) => {
  const VERIFY_TOKEN = "LIGAKOM";

  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (!mode || !token)
    return res.status(500).send("Hubo un problema con el webhook");
  if (mode !== "subscribe") return res.sendStatus(403);
  if (token !== VERIFY_TOKEN) return res.status(403).send("Token no válido");

  console.log("WEBHOOK_VERIFIED ✅");
  return res.json({ "hub.challenge": challenge });
};

const stravaWebhook = async (req = request, res = response) => {
  console.log("🚀 Event received from Strava!!!");

  const { owner_id } = req.body;

  const { data: user, error: errorUser } = await supabase
    .from("athletes")
    .select("id, username, refresh_token, access_token")
    .eq("strava_id", owner_id)
    .single();

  if (errorUser) {
    return res.status(404).send(errorUser);
  }

  // refrescar token
  const credentials = await refreshToken(user.refresh_token);
  const payload = {
    refresh_token: credentials.refresh_token,
    access_token: credentials.access_token,
    expires_at: credentials.expires_at,
    expires_in: credentials.expires_in,
  };
  const { data: refreshData, error: errorRefresh } = await supabase
    .from("athletes")
    .update(payload)
    .eq("strava_id", owner_id)
    .single();

  if (errorRefresh) {
    return res.status(404).send(errorRefresh);
  }

  // obtener ligas del usuario
  const { data, error: errorLeagues } = await supabase.from("leagues").select(
    `id, name, start_date, end_date,
    athletes!athlete_league (id),
    segments!segment_league (id)`
  );
  const leagues = data.filter((league) =>
    league.athletes.some((athlete) => athlete.id === user.id)
  );

  if (errorLeagues) {
    return res.status(404).send(errorLeagues);
  }

  const leaguesToImport = leagues.map((league) => {
    return {
      start_date: league.start_date,
      end_date: league.end_date,
      segments: league.segments.map((segment) => segment.id),
    };
  });

  leaguesToImport.forEach(async (league) => {
    const segmentEfforts = await getSegmentEfforts(
      credentials.access_token,
      league.segments,
      league.start_date,
      league.end_date
    );

    segmentEfforts.forEach(async (arrEfforts) => {
      const efforts = formatEffort(arrEfforts);
      const { data: dataEfforts, error: errorEfforts } = await supabase
        .from("efforts")
        .upsert(efforts);

      if (errorEfforts) {
        return res.status(404).send(errorEfforts);
      }
    });
  });

  return res.status(200).send("EVENT_RECEIVED");
};

// Obtener segmentos de Strava
// Se obtiene la información de los segmentos de Strava pasándo como parámetro un
// array de ids separados por comas
// Ejemplo:
//    http://localhost:3100/strava/segments/1123711,1122674
//
// Respuesta:
//    Devuelve un array de segmentos guardados en mongodb
const getAndSaveSegments = async (req = request, res = response) => {
  if (!req.headers.authorization) {
    return res.status(401).send("No autorizado");
  }
  const access_token = req.headers.authorization.split("Bearer ")[1];

  if (!access_token) {
    return res.status(401).json({ msg: "No se encontró el token" });
  }

  const ids = req.params.array.split(",");

  await Promise.all(
    ids.map(async (sid) => {
      const segmentInfo = await getSegmentInformation({ sid, access_token });
      return Segment.updateOne(
        { idStrava: +sid },
        { ...segmentInfo },
        { upsert: true }
      );
    })
  );

  const responseUpdatedSegments = await Segment.find({
    idStrava: { $in: ids },
  });

  return res.status(200).send(responseUpdatedSegments);
};

module.exports = { strava, stravaWebhook, getAndSaveSegments };
