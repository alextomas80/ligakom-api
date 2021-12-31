const { Day, Event, Category, Ocio, Gaiata } = require("../models");

const allowedCollections = (coleccion = "", colecciones = []) => {
  const incluida = colecciones.includes(coleccion);
  if (!incluida) {
    throw new Error(
      `La colección ${coleccion} no es permitida, ${colecciones}`
    );
  }
  return true;
};

const checkIdDay = async (id) => {
  const day = await Day.findById(id);
  if (!day) {
    throw new Error(`El id no existe ${id}`);
  }
};

const checkIdEvent = async (id) => {
  const event = await Event.findById(id);
  if (!event) {
    throw new Error(`El id no existe ${id}`);
  }
};

const checkIdCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new Error(`El id no existe ${id}`);
  }
};

const checkIdOcio = async (id) => {
  const itemOcio = await Ocio.findById(id);
  if (!itemOcio) {
    throw new Error(`El id no existe ${id}`);
  }
};

const checkIdGaiata = async (id) => {
  const itemGaiata = await Gaiata.findById(id);
  if (!itemGaiata) {
    throw new Error(`El id no existe ${id}`);
  }
};

module.exports = {
  allowedCollections,
  checkIdDay,
  checkIdEvent,
  checkIdCategory,
  checkIdOcio,
  checkIdGaiata,
};
