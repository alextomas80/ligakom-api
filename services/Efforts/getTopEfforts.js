// const supabase = require("../supabaseInit");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const getTopEfforts = async (effort, quantity = 3) => {
  const { league_id, segment_id, elapsed_time, effort_id } = effort;

  const { data, error } = await supabase
    .from("efforts")
    .select(`*, athletes!athlete_id(firstname,lastname)`)
    .eq("league_id", league_id)
    .eq("segment_id", segment_id)
    .order("elapsed_time", "desc")
    .range(0, quantity - 1);

  if (error) {
    console.log(error);
    throw Error(`No se ha podido obtener el TOP${quantity}`);
  }

  return data;
};

module.exports = getTopEfforts;
