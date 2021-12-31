const { response } = require("express");
const fieldsStringToArray = require("../helpers/fieldsStringToArray");
const { removeFileOnServer } = require("../helpers/removeFileOnServer");
const Location = require("../models/location");

const findAll = async (_req, res = response) => {
  const items = await Location.find().sort("name");

  res.status(200).json({ items });
};

const findOne = async (req, res = response) => {
  const { fields = "" } = req.body;
  const { id } = req.params;

  const item = await Location.findById(id).select(fieldsStringToArray(fields));
  res.status(200).json(item);
};

const create = async (req, res = response) => {
  const location = new Location(req.body);

  try {
    const item = await location.save();
    res.status(200).json(item);
  } catch (error) {
    res.status(500).send({
      ok: false,
      msg: "Por favor, hable con el administrador.",
    });
  }
};

const update = async (req, res = response) => {
  const itemId = req.params.id;

  try {
    const item = await Location.findById(itemId);

    if (!item) {
      return res.status(404).send({ msg: "La ubicación no existe." });
    }

    const payload = { ...req.body };

    const location = await Location.findByIdAndUpdate(itemId, payload, {
      new: true,
    });
    res.json(location);
  } catch (error) {
    res.status(500).send({ msg: "Por favor, hable con el administrador." });
  }
};

const remove = async (req, res = response) => {
  const { id } = req.params;

  try {
    const item = await Location.findById(id);
    if (!item) {
      return res.status(404).send({ msg: "La ubicación no existe." });
    }
    await Location.findByIdAndRemove(id);
    if (item.image) {
      removeFileOnServer({ url: item.image, collection: "locations" });
    }
    res.json({ msg: "La ubicación se ha eliminado correctamente." });
  } catch (error) {
    res.status(500).send({ msg: "Por favor, hable con el administrador." });
  }
};

module.exports = { findAll, create, update, remove, findOne };
