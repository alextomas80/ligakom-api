const { response } = require("express");

const { Setting } = require("../models");
const { deleteKeysByPattern } = require("../database/cache");
const { SETTINGS_CACHE_PATTERN } = require("../database/cacheKeys");

const getSettings = async (_req, res = response) => {
  try {
    const [settings] = await Setting.find().limit(1).skip(0);
    return res.status(200).json(settings);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Por favor, hable con el administrador." });
  }
};

const setSettings = async (req, res = response) => {
  try {
    const [settings] = await Setting.find().limit(1).skip(0);
    const { id } = settings;

    const payload = { ...req.body };

    const item = await Setting.findByIdAndUpdate(id, payload, {
      new: true,
      overwrite: true,
    });
    deleteKeysByPattern(SETTINGS_CACHE_PATTERN);
    return res.status(200).json(item);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      msg: "Por favor, hable con el administrador.",
    });
  }
};

module.exports = { getSettings, setSettings };
