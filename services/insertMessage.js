// const supabase = require("../supabaseInit");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const insertMessage = async (payload) => {
  const { data, error } = await supabase.from("messages").insert(payload);

  if (error) {
    throw Error(`No se ha podido insertar el mensaje`);
  }

  return data;
};

module.exports = insertMessage;
