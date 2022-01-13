const { response, request } = require("express");
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

// const stravaWebhookOld = async (req = request, res = response) => {
//   console.log("🚀 Event received from Strava!!!");

//   const { owner_id } = req.body;

//   const { data: user, error: errorUser } = await supabase
//     .from("athletes")
//     .select("id, username, refresh_token, access_token")
//     .eq("strava_id", owner_id)
//     .single();

//   if (errorUser) {
//     return res.status(404).send(errorUser);
//   }

//   // refrescar token
//   const credentials = await refreshToken(user.refresh_token);

//   const payload = {
//     refresh_token: credentials.refresh_token,
//     access_token: credentials.access_token,
//     expires_at: credentials.expires_at,
//     expires_in: credentials.expires_in,
//   };
//   const { data: refreshData, error: errorRefresh } = await supabase
//     .from("athletes")
//     .update(payload)
//     .eq("strava_id", owner_id)
//     .single();

//   if (errorRefresh) {
//     return res.status(404).send(errorRefresh);
//   }

//   // obtener ligas del usuario
//   const { data, error: errorLeagues } = await supabase.from("leagues").select(
//     `id, name, start_date, end_date,
//     athletes!athlete_league (id),
//     segments!segment_league (id)`
//   );
//   const leagues = data.filter((league) => {
//     return league.athletes.filter((athlete) => athlete.id === user.id);
//   });

//   if (errorLeagues) {
//     return res.status(404).send(errorLeagues);
//   }

//   const leaguesToImport = leagues.map((league) => {
//     return {
//       start_date: league.start_date,
//       end_date: league.end_date,
//       segments: league.segments.map((segment) => segment.id),
//     };
//   });

//   leaguesToImport.forEach(async (league) => {
//     const segmentEfforts = await getSegmentEfforts(
//       credentials.access_token,
//       league.segments,
//       league.start_date,
//       league.end_date
//     );

//     segmentEfforts.forEach(async (arrEfforts) => {
//       const efforts = formatEffort(arrEfforts);
//       const { data: dataEfforts, error: errorEfforts } = await supabase
//         .from("efforts")
//         .upsert(efforts);

//       if (errorEfforts) {
//         return res.status(404).send(errorEfforts);
//       }
//     });
//   });

//   return res.status(200).send("EVENT_RECEIVED");
// };

const stravaWebhook = async (req = request, res = response) => {
  console.log("🚀 🚀 🚀 Event received from Strava");

  const { owner_id, object_id } = req.body;

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

  // obtener información de la actividad
  const responseActivity = await getActivity(
    credentials.access_token,
    object_id
  );
  if (responseActivity.errors) {
    return res.status(404).send(responseActivity);
  }

  const { segment_efforts } = responseActivity;

  // obtener ligas del usuario
  const { data, error: errorLeagues } = await supabase.from("leagues").select(
    `id, name, start_date, end_date,
    athletes!athlete_league (id),
    segments!segment_league (id)`
  );
  const leagues = data.filter((league) => {
    return league.athletes.filter((athlete) => athlete.id === user.id);
  });

  if (errorLeagues) {
    return res.status(404).send(errorLeagues);
  }

  const segmentsToSave = [];
  leagues.forEach((league) => {
    const ids = league.segments.map((segment) => segment.id);
    segmentsToSave.push(...ids);
  });

  // recorro los esfueros del usuario y si está en sus ligas se guarda
  segment_efforts.forEach(async (effort) => {
    if (segmentsToSave.includes(effort.segment.id)) {
      const { data: dataEfforts, error: errorEfforts } = await supabase
        .from("efforts")
        .upsert(formatEffort(effort));
      if (errorEfforts) {
        return res.status(404).send(errorEfforts);
      }
    }
  });

  return res.status(200).send("EVENT_RECEIVED");
};

module.exports = { strava, stravaWebhook };
