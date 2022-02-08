// const supabase = require("../supabaseInit");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const getLeague = async (leagueId) => {
  const { data, error } = await supabase
    .from("leagues")
    .select(
      `id, start_date, end_date, name, points,
       athletes!athlete_league (id, strava_id, firstname, lastname, sex, photo_url),
       segments!segment_league (id)`
    )
    .eq("id", leagueId)
    .single();

  if (error) {
    throw Error(
      `No se ha podido obtener la información de la liga (${leagueId})`
    );
  }

  return data;
};

module.exports = getLeague;
