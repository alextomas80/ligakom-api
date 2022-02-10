// const supabase = require("../supabaseInit");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const removeEffortQueued = async (id) => {
  const { error } = await supabase.from("queue_efforts").delete().eq("id", id);

  if (error) {
    throw Error(`No se ha podido eliminar el esfuerzo de la cola`);
  }

  return true;
};

module.exports = removeEffortQueued;
