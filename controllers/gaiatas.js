const { response } = require("express");

const { deleteKeysByPattern } = require("../database/cache");
const { Gaiata } = require("../models");
const { removeFileOnServer } = require("../helpers/removeFileOnServer");
const fieldsStringToArray = require("../helpers/fieldsStringToArray");
const { GAIATAS_CACHE_PATTERN } = require("../database/cacheKeys");

const findAll = async (req, res = response) => {
  const { fields = "" } = req.body;
  const { limit = 30, skip = 0 } = req.query;
  const query = {};

  const [total, items] = await Promise.all([
    Gaiata.countDocuments(query),
    Gaiata.find(query)
      .select(fieldsStringToArray(fields))
      .sort("order")
      .limit(Number(limit))
      .skip(Number(skip)),
  ]);

  return res.status(200).json({
    total,
    pages: Math.ceil(total / limit),
    items,
  });
};

const findOne = async (req, res = response) => {
  const { fields = "" } = req.body;
  const { id } = req.params;

  const item = await Gaiata.findById(id).select(fieldsStringToArray(fields));
  return res.status(200).json(item);
};

const create = async (req, res = response) => {
  const item = new Gaiata(req.body);

  try {
    const itemCreated = await item.save();
    deleteKeysByPattern(`${GAIATAS_CACHE_PATTERN}*`);
    return res.status(200).json(itemCreated);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      msg: "Por favor, hable con el administrador.",
    });
  }
};

const update = async (req, res = response) => {
  const { id } = req.params;
  const { image, uid, ...data } = req.body;
  try {
    const item = await Gaiata.findByIdAndUpdate(id, data, {
      new: true,
    });
    deleteKeysByPattern(`${GAIATAS_CACHE_PATTERN}*`);
    return res.status(200).json(item);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ msg: "Por favor, hable con el administrador." });
  }
};

const remove = async (req, res = response) => {
  const { id } = req.params;

  try {
    const item = await Gaiata.findById(id);
    if (item.image) {
      removeFileOnServer({ url: item.image, collection: "gaiatas" });
    }
    await Gaiata.findByIdAndRemove(id);
    deleteKeysByPattern(`${GAIATAS_CACHE_PATTERN}*`);

    return res
      .status(200)
      .json({ msg: "La gaiata se ha eliminado correctamente." });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ msg: "Por favor, hable con el administrador." });
  }
};

module.exports = { findAll, findOne, create, update, remove };
