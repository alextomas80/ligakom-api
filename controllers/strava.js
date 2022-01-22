const { response, request } = require("express");
const { formatDate } = require("../helpers/formatDate");
const formatEffort = require("../helpers/formatEffort");

const { refreshToken, getActivity } = require("../services/strava");
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
  const { owner_id, object_id } = req.body;

  if (!owner_id || !object_id) {
    return res.status(500).send("owner_id, object_id sin requeridos");
  }

  console.log(" 🥳 🥳 🥳  Event received from Strava");

  const { data: user, error: errorUser } = await supabase
    .from("athletes")
    .select("id, username, firstname, lastname, refresh_token, access_token")
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

  // obtener información de la actividad
  const responseActivity = await getActivity(
    credentials.access_token,
    object_id
  );
  if (responseActivity.errors) {
    return res.status(404).send(responseActivity);
  }

  const { segment_efforts } = responseActivity;
  console.log(`🔥 Obtenidos ${segment_efforts.length} esfuerzos`);

  // obtener ligas del usuario
  const today = formatDate(new Date());

  const { data, error: errorLeagues } = await supabase
    .from("leagues")
    .select(
      `id, name, start_date, end_date,
       segments!segment_league (id),
       athletes!athlete_league (id)`
    )
    .lte("start_date", today)
    .gte("end_date", today)
    .order("name");

  const leagues = data.filter((league) => {
    const athletes = league.athletes.map((athlete) => athlete.id);
    return athletes.includes(user.id);
  });

  if (errorLeagues) {
    return res.status(404).send(errorLeagues);
  }

  const segmentsToSave = [];
  leagues.forEach((league) => {
    const ids = league.segments.map((segment) => segment.id);
    if (ids) {
      segmentsToSave.push({ league_id: league.id, segments: [...ids] });
    }
  });

  // recorro los esfueros del usuario y si está en sus ligas se guarda

  const searchSementInsideEfforts = (segment_id) => {
    return segment_efforts.find((effort) => effort.segment.id === segment_id);
  };

  let totalEfforts = 0;

  segmentsToSave.forEach(({ league_id, segments }) => {
    segments.forEach(async (segment_id) => {
      const effort = searchSementInsideEfforts(segment_id);
      if (effort) {
        totalEfforts++;
        const { data: dataEfforts, error: errorEfforts } = await supabase
          .from("efforts")
          .upsert(formatEffort(effort, league_id));
      }
    });
  });

  return res
    .status(200)
    .send(`${totalEfforts} esfuerzos para ${user.firstname} ${user.lastname}`);
};

module.exports = { strava, stravaWebhook };
