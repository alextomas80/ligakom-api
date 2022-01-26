const { response, request } = require("express");
const { formatDate } = require("../helpers/formatDate");
const formatEffort = require("../helpers/formatEffort");
const dayjs = require("dayjs");
const axios = require("axios");

const { refreshToken, getActivity } = require("../services/strava");
const {
  supabase,
  updateAthlete,
  getUserLeagues,
  insertEfforts,
} = require("../services/supabase");

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

  console.log("⏰ Event received from Strava");

  const { data: user, error: errorUser } = await supabase
    .from("athletes")
    .select("id, username, firstname, lastname, refresh_token, access_token")
    .eq("strava_id", owner_id)
    .single();

  // montamos el nombre del atleta
  const athleteName = `${user.firstname} ${user.lastname}`;
  console.log(`🤵🏻 ${athleteName}`);

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

  const access_token = credentials.access_token;

  // promesas
  const updateDataAthlete = await updateAthlete(payload, owner_id);
  const getActivityDetails = await getActivity(access_token, object_id);
  const getLeagues = await getUserLeagues(user.id);

  return Promise.all([updateDataAthlete, getActivityDetails, getLeagues])
    .then(async (resp) => {
      const currentAthlete = resp[0];
      const activity = resp[1];
      const leagues = resp[2];

      const { segment_efforts } = activity;
      console.log(
        `💪🏼 ${segment_efforts.length} segmentos, actividad ${activity.name}`
      );

      // obtener nombres de las ligas
      const leagueNames = leagues.map((league) => league.name);
      console.log(`🚴🏻‍♂️ ${leagues.length} liga(s): ${leagueNames}`);

      // generamos un array con las ligas y segmentos para guardar
      const segmentsToSave = [];
      leagues.forEach((league) => {
        const ids = league.segments.map((segment) => segment.id);
        if (ids) {
          segmentsToSave.push({
            league_id: league.id,
            start_date: league.start_date,
            segments: [...ids],
          });
        }
      });

      const searchSementInsideEfforts = (segment_id) => {
        return segment_efforts.find(
          (effort) => effort.segment.id === segment_id
        );
      };

      let bulkEfforts = [];
      let effortsName = [];

      segmentsToSave.forEach(({ league_id, start_date, segments }) => {
        segments.forEach(async (segment_id) => {
          const effort = searchSementInsideEfforts(segment_id);
          if (effort) {
            effortsName.push(effort.name);
            const dateEffort = dayjs(effort.start_date, "YYYY-MM-DD");
            const dateStartLeague = dayjs(start_date, "YYYY-MM-DD");
            const isAfter = dateEffort.isAfter(dateStartLeague);
            if (isAfter) {
              bulkEfforts.push(formatEffort(effort, league_id));
            }
          }
        });
      });

      const { data, error } = await insertEfforts(bulkEfforts);
      if (error) {
        return res.status(500).send(error);
      } else {
        console.log(
          `💾 Guardado ${bulkEfforts.length} esfuerzo(s): ${effortsName}`
        );

        await sendNotification({
          title: `${athleteName} ha subido una nueva actividad`,
          body: `${bulkEfforts.length} esfuerzo(s) nuevos en ${effortsName}`,
        });

        return res
          .status(200)
          .send(
            `💾 ${bulkEfforts.length} esfuerzo(s) guardados: ${effortsName}`
          );
      }
    })
    .catch((error) => {
      console.log("error", error);
      return res.status(500).send(error.toString());
    });
};

const sendNotification = async (payload) => {
  // TODO, gestionar los tokens
  const expoToken = "ExponentPushToken[x0M-9cM_7G8ambehEEcs2E]";

  const { title, body } = payload;

  try {
    const response = await axios.post("https://exp.host/--/api/v2/push/send", {
      to: expoToken,
      title,
      body,
    });
    return response.data;
  } catch (error) {
    return error;
  }
};

module.exports = { strava, stravaWebhook };
