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
  getTokens,
  addActivityToQueue,
  getActivityFromQueue,
  deleteActivityFromQueue,
  insertQueuetEfforts,
  getEffortsQueued,
} = require("../services/supabase");
const sendNotificationEffort = require("../services/sendNotificationEffort");

// const tokensDevelopment = [
//   "ExponentPushToken[cUTozLFhENivdwIlxAxI87]", // android emulator
//   "ExponentPushToken[lPRSXUDfHS5oP5wp9ktD2k]", // iOS Alex
// ];
const tokensNotificationError = "ExponentPushToken[lPRSXUDfHS5oP5wp9ktD2k]";

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
  const { owner_id, object_id, aspect_type } = req.body;

  if (aspect_type !== "create") {
    console.log(`⚠️ Recibida actividad ${aspect_type}`);
    console.log(req.body);
    return res.status(204).send(`Recibida actividad ${aspect_type}`);
  }

  if (!owner_id || !object_id) {
    console.log(`⚠️ owner_id, object_id son requeridos`);
    console.log(req.body);
    return res.status(404).send("owner_id, object_id son requeridos");
  }

  console.log("⏰ Evento recibido de Strava");

  // queue activity
  const payloadQueue = {
    owner_id,
    object_id,
  };
  const { data: dataQueue, error: errorQueue } = await addActivityToQueue(
    payloadQueue
  );

  if (dataQueue) {
    console.log("⏳ Actividad añadida a la cola");
    return res.status(200).send("Actividad añadida a la cola");
  } else {
    return res
      .status(500)
      .send("Hubo un error al añadir la actividad a la cola");
  }
};

/**
 * Procesamos la cola de actividades
 * @param {*} req
 * @param {*} res
 * @returns
 */
const queueProcess = async (req = request, res = response) => {
  const { key } = req.query;

  if (!key || !key.includes("LIGAKOM")) {
    return res.status(500).send("No permitido.");
  }

  const { data, error } = await getActivityFromQueue();

  if (!data) {
    return res.status(200).send("Todo al día.");
  }

  if (error) {
    return res.status(500).send(error);
  }

  // borramos la actividad de la cola
  await deleteActivityFromQueue(data.id);
  console.log("🗑 Actividad eliminada.");

  const { owner_id, object_id } = data;

  const { data: user, error: errorUser } = await supabase
    .from("athletes")
    .select("id, username, firstname, lastname, refresh_token, access_token")
    .eq("strava_id", owner_id)
    .single();

  if (errorUser) {
    return res.status(404).send(errorUser);
  }

  // montamos el nombre del atleta
  const athleteName = `${user.firstname} ${user.lastname}`;
  console.log(`🤵🏻 ${athleteName}`);

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
            current: user.id,
            athleteName,
            league_id: league.id,
            league_name: league.name,
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
      const { data: data2, error: error2 } = await insertQueuetEfforts(
        bulkEfforts
      );

      if (error) {
        return res.status(500).send(error);
      } else {
        console.log(
          `💾 Guardado ${bulkEfforts.length} esfuerzo(s): ${effortsName}`
        );

        return res
          .status(200)
          .send(
            bulkEfforts.length
              ? `💾 ${bulkEfforts.length} esfuerzo(s) guardados: ${effortsName}`
              : `💾 No hay nuevos esfuerzos`
          );
      }
    })
    .catch((error) => {
      const errorString = error.toString();
      // enviar error
      const payloadError = {
        to: tokensNotificationError,
        message: "Error en el webhook",
        body: errorString,
      };
      sendNotification(payloadError);
      return res.status(500).send(errorString);
    });
};

/**
 * ENVIAR NOTIFICACIONES DE PRs
 * Procesa los esfuerzos pendientes de notificar de la tabla queue_efforts
 */
const queueProcessEfforts = async (req = request, res = response) => {
  const response = await sendNotificationEffort(1);
  return res.status(200).send(response);
};

const sendNotification = async (payload) => {
  try {
    const response = await axios.post(
      "https://exp.host/--/api/v2/push/send",
      payload
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

const generateMessagesToNotifify = async (segmentsToSave) => {
  const leaguesToNotify = segmentsToSave.map((league) => {
    return {
      current: league.current,
      athleteName: league.athleteName,
      league_id: league.league_id,
      league_name: league.league_name,
    };
  });

  let promises = leaguesToNotify.map((league) => getTokens(league));

  Promise.all(promises).then((tokens) => {
    tokens.forEach((messages) => {
      sendNotification(messages);
    });
  });
};

module.exports = { strava, stravaWebhook, queueProcess, queueProcessEfforts };
