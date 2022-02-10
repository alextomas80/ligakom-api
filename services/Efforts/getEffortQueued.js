// const supabase = require("../supabaseInit");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const getEffortQueued = async (limit) => {
  const { data, error } = await supabase
    .from("queue_efforts")
    .select(
      `*, athletes!athlete_id(firstname, lastname), segments!segment_id(name)`
    )
    .order("id", "asc")
    .limit(limit);

  if (error) {
    throw Error(`No se han podido obtener los esfuerzos de la cola`);
  }

  return data;
};

module.exports = getEffortQueued;
