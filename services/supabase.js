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

module.exports = {
  supabase,
  updateAthlete,
  getUserLeagues,
  insertEfforts,
  getTokens,
  addActivityToQueue,
  getActivityFromQueue,
  deleteActivityFromQueue,
};
