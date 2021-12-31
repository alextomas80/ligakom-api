const { response } = require("express");

const { Category } = require("../models");
const { deleteKeysByPattern } = require("../database/cache");
const { removeFileOnServer } = require("../helpers/removeFileOnServer");
const fieldsStringToArray = require("../helpers/fieldsStringToArray");
const { EVENTS_CACHE_PATTERN } = require("../database/cacheKeys");

const findAll = async (req, res = response) => {
  const { ocio = false } = req.query;

  const items = await Category.find().where("ocio", ocio).sort("name");
  res.status(200).json({ items });
};

const findOne = async (req, res = response) => {
  const { fields = "" } = req.body;
  const { id } = req.params;

  const item = await Category.findById(id).select(fieldsStringToArray(fields));
  res.status(200).json(item);
};

const create = async (req, res = response) => {
  try {
    const category = new Category(req.body);
    const item = await category.save();
    removeCache();
    return res.status(200).json(item);
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Por favor, hable con el administrador." });
  }
};

/**
 * Actualizar categoría
 */
const update = async (req, res = response) => {
  const itemId = req.params.id;

  try {
    const payload = {
      ...req.body,
    };

    const category = await Category.findByIdAndUpdate(itemId, payload, {
      new: true,
    });
    removeCache();
    return res.status(200).json(category);
  } catch (error) {
    res.status(500).send({
      ok: false,
      msg: "Por favor, hable con el administrador.",
    });
  }
};

const remove = async (req, res = response) => {
  const { id } = req.params;

  try {
    const item = await Category.findById(id);

    if (item.image) {
      removeFileOnServer({ url: item.image, collection: "categories" });
    }
    await Category.findByIdAndRemove(id);
    removeCache();
    return res
      .status(200)
      .json({ msg: "La categoría se ha eliminado correctamente." });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ msg: "Por favor, hable con el administrador." });
  }
};

const removeCache = () => {
  deleteKeysByPattern(`ocio:*`);
  deleteKeysByPattern(`category:*`);
  deleteKeysByPattern(`${EVENTS_CACHE_PATTERN}*`);
};

module.exports = { findAll, findOne, create, update, remove };
