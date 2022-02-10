const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * A partir del id de una liga, obtiene los tokens de todos los usuarios
 * que tienen habilitadas las notificaciones
 * @param {Number} leagueId ID de la liga
 * @returns {Array} Array con los tokens de los usuarios
 */
const getTokensLeague = async (leagueId) => {
  const { data, error } = await supabase
    .from("athlete_league")
    .select("*")
    .match({ league_id: leagueId });

  const idsAthletes = data.map((athlete) => athlete.athlete_id);

  const { data: athletes, error: errorAthletes } = await supabase
    .from("athletes")
    .select(`username, firstname, lastname, token`)
    .eq("notifications", true)
    .in("id", idsAthletes)
    .not("token", "eq", null);

  if (error || errorAthletes) {
    throw Error(`No se han podido obtener los tokens de los usuarios`);
  }

  return athletes;
};

module.exports = getTokensLeague;
