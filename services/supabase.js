const { createClient } = require("@supabase/supabase-js");
const { formatDate } = require("../helpers/formatDate");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const updateAthlete = async (payload, strava_id) => {
  const { data } = await supabase
    .from("athletes")
    .update(payload)
    .eq("strava_id", strava_id)
    .single();
  return data;
};

const getUserLeagues = async (user_id) => {
  const today = formatDate(new Date());

  const { data, error } = await supabase
    .from("leagues")
    .select(
      `id, name, start_date, end_date,
     segments!segment_league (id),
     athletes!athlete_league (id)`
    )
    .lte("start_date", today)
    .gte("end_date", today)
    .order("name");

  if (error) {
    console.log("⚠️  [ERROR getUserLeagues]", error.message);
    return new Error(error.message);
  }

  const leagues = data.filter((league) => {
    const athletes = league.athletes.map((athlete) => athlete.id);
    return athletes.includes(user_id);
  });

  return leagues;
};

const insertEfforts = async (efforts) => {
  const { data, error } = await supabase.from("efforts").insert(efforts);

  if (error) {
    console.log("⚠️  [ERROR insertEfforts]", error.message);
    return new Error(error.message);
  }

  return { data, error };
};

const insertQueuetEfforts = async (efforts) => {
  const effortsQueue = efforts.map((effort) => {
    const { league_id, athlete_id, segment_id, elapsed_time } = effort;
    return {
      league_id,
      athlete_id,
      segment_id,
      elapsed_time,
    };
  });
  const { data, error } = await supabase
    .from("queue_efforts")
    .insert(effortsQueue);

  if (error) {
    console.log("⚠️  [ERROR insertQueueEfforts]", error.message);
    return new Error(error.message);
  }

  return { data, error };
};

const getEffortsQueued = async (limit) => {
  const response = { error: null, messages: null };
  const { data, error } = await supabase
    .from("queue_efforts")
    .select(
      "id, league_id, elapsed_time, athletes!athlete_id(strava_id, firstname, lastname), segments!segment_id(id, name), leagues!league_id(name)"
    )
    .limit(limit)
    .single();

  // no hay registros anteriores
  if (!data) {
    return response;
  }

  const idEffortQueued = data.id;
  const athleteIDwithNewKom = data.athletes.strava_id;

  const { league_id, elapsed_time: newElapsedTime } = data;
  const {
    segments: { id: segment_id, name: segmentName },
  } = data;
  const {
    athletes: { firstname, lastname },
  } = data;
  const newKomAthlete = `${firstname} ${lastname}`;
  const {
    leagues: { name: leagueName },
  } = data;

  const { data: lastItemEffort } = await supabase
    .from("efforts")
    .select(
      "elapsed_time, athletes!athlete_id(strava_id, firstname, token, notifications)"
    )
    .match({ league_id, segment_id })
    .limit(1)
    .order("elapsed_time")
    .single();

  // no hay registros anteriores
  if (!lastItemEffort) {
    return response;
  }

  const { elapsed_time: lastElapsedTime } = lastItemEffort;

  if (newElapsedTime < lastElapsedTime) {
    const messages = [];
    const tokens = await getAllAthleteTokensLeague(league_id);

    // enviar mensaje a todos los de la liga
    tokens.forEach((item) => {
      const iAm = item.athletes.strava_id === athleteIDwithNewKom;
      const to = item.athletes.token;
      const title = `${leagueName}: ${segmentName}`;
      const difference = lastElapsedTime - newElapsedTime;
      const body = iAm
        ? `🔥 Has mejorado el tiempo en ${difference}"`
        : `🔥 ${newKomAthlete} ha mejorado el tiempo en ${difference}"`;
      messages.push({
        title,
        body,
        to,
        badge: 1,
        sound: "default",
      });
    });
    response.messages = messages;
    console.log(messages);
  }

  await supabase.from("queue_efforts").delete().eq("id", idEffortQueued);

  return response;
};

const getTokens = async (league) => {
  const { data, error } = await supabase
    .from("athlete_league")
    .select("athlete_id, athletes!athlete_id(token)")
    .eq("league_id", league.league_id);

  const tokens = data.filter((athlete) => athlete.athletes.token);
  const messages = generateMessages({
    name: league.league_name,
    current: league.current,
    athleteName: league.athleteName,
    tokens,
  });

  return messages;
};

const generateMessages = ({ name, current, athleteName, tokens }) => {
  const messages = [];
  tokens.forEach((item) => {
    const iAm = item.athlete_id === current;
    const to = item.athletes.token;
    const message = `Nueva actividad en ${name}`;
    const body = iAm
      ? "✅ Tu actividad se ha subido correctamente"
      : `🔥 ${athleteName} ha sincronizado una nueva actividad`;
    messages.push({
      message,
      body,
      to,
    });
  });
  return messages;
};

const addActivityToQueue = async (payload) => {
  const { data, error } = await supabase
    .from("queue_activities")
    .insert(payload);

  return { data, error };
};

const getActivityFromQueue = async () => {
  const { data, error } = await supabase
    .from("queue_activities")
    .select()
    .order("created_at")
    .limit(1)
    .single();

  return { data, error };
};

const deleteActivityFromQueue = async (id) => {
  const { data, error } = await supabase
    .from("queue_activities")
    .delete()
    .eq("id", id);

  return { data, error };
};

const getAllAthleteTokensLeague = async (league_id) => {
  const { data, error } = await supabase
    .from("athlete_league")
    .select("athlete_id, athletes!athlete_id(strava_id, token, notifications)")
    .eq("league_id", league_id);
  const tokens = data.filter((athlete) => athlete.athletes.notifications);
  return tokens;
};

module.exports = {
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
};
