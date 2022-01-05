const { League } = require("../models");

const allowedCollections = (coleccion = "", colecciones = []) => {
  const incluida = colecciones.includes(coleccion);
  if (!incluida) {
    throw new Error(
      `La colección ${coleccion} no es permitida, ${colecciones}`
    );
  }
  return true;
};

const checkIdLeague = async (id) => {
  const league = await League.findById(id);
  if (!league) {
    throw new Error(`El id no existe ${id}`);
  }
};

module.exports = {
  allowedCollections,
  checkIdLeague,
};
