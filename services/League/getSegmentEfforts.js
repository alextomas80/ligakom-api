// const supabase = require("../supabaseInit");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const getSegmentEfforts = async (
  start_date,
  end_date,
  segment_id,
  league_id
) => {
  const { data, error } = await supabase
    .from("efforts")
    .select("*")
    .eq("segment_id", segment_id)
    .eq("league_id", league_id)
    .gte("start_date", start_date)
    .lte("start_date", end_date)
    .order("elapsed_time");

  if (error) {
    throw Error(`No se han podido obtener los esfuerzos (${league_id})`);
  }

  return data;
};

module.exports = getSegmentEfforts;
