const getEffortQueued = require("./Efforts/getEffortQueued");
const getTokensLeague = require("./Tokens/getTokensLeague");
const sendNotification = require("./sendNotification");
const removeEffortQueued = require("./Efforts/removeEffortQueued");
const getTopEfforts = require("./Efforts/getTopEfforts");
const insertMessage = require("./insertMessage");

const secondsToHms = (d) => {
  d = Number(d);

  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor((d % 3600) % 60);

  const hDisplay = h > 0 ? `${h}h ` : "";
  const mDisplay = m > 0 ? `${m}m ` : "";
  const sDisplay = s > 0 ? `${s}s` : "";

  return `${hDisplay}${mDisplay}${sDisplay}`;
};

const sendNotificationEffort = async (limit) => {
  // obtenemos X esfuerzos de la cola
  const efforsQueued = await getEffortQueued(limit);

  efforsQueued.forEach(async (effort) => {
    const segmentName = effort.segments.name;

    const leagueId = effort.league_id;

    // obtenemos los token de la liga
    const usersTokens = await getTokensLeague(leagueId);

    const quantityTop = 2;
    const topEfforts = await getTopEfforts(effort, quantityTop);

    let isPR = false;
    let first = topEfforts[0];
    let second = topEfforts[1] || null;
    let diff = null;

    // Si el esfuerzo a revisar coincide con TOP1
    // y es de sí mismo, es PR 🔥
    if (
      effort.elapsed_time === first.elapsed_time &&
      effort.athlete_id === first.athlete_id
    ) {
      isPR = true;
      if (second) {
        diff = second.elapsed_time - effort.elapsed_time;
      }
    }

    if (isPR) {
      // generar los mensajes
      const messages = [];
      usersTokens.forEach(({ token }) => {
        const title = segmentName;
        const body = diff
          ? `🔥 ${effort.athletes.firstname} ${
              effort.athletes.lastname
            } ha mejorado el tiempo en ${secondsToHms(diff)}.`
          : `🔥 Nuevo PR de ${effort.athletes.firstname} ${effort.athletes.lastname}`;

        const message = { to: token, title, body };
        messages.push(message);
      });

      // inserto el mensaje en la tabla, para verlo en el chat
      await insertMessage({
        athlete_id: "11111111-2222-3333-4444-555555555555",
        message: messages[0].body,
        league_id: effort.league_id,
      });

      // enviar mensaje 🚀
      await sendNotification(messages);
      console.log(`💌 ${messages.length} mensajes notificados`);

      // eliminar esfuerzo
      await removeEffortQueued(effort.id);
    } else {
      // eliminar esfuerzo
      await removeEffortQueued(effort.id);
      console.log(`🥱 No se ha mejorado el tiempo de "${segmentName}"`);
    }
  });

  return efforsQueued;
};

module.exports = sendNotificationEffort;
