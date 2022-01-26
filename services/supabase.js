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

module.exports = { supabase, updateAthlete, getUserLeagues, insertEfforts };
