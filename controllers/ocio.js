const { response } = require("express");
const { Ocio } = require("../models");
const { deleteKeysByPattern } = require("../database/cache");
const { removeFileOnServer } = require("../helpers/removeFileOnServer");

const findAll = async (_req, res = response) => {
  const items = await Ocio.find().populate("category").sort("name");
  res.status(200).json(items);
};

const findOne = async (req, res = response) => {
  const { id } = req.params;

  const item = await Ocio.findById(id);
  return res.status(200).json(item);
};

const findList = async (req, res = response) => {
  const { id } = req.params;
  const query = { category: id };
  const { limit = 15, skip = 0 } = req.query;

  const [total, items] = await Promise.all([
    Ocio.countDocuments(query),
    Ocio.find(query)
      .sort({
        sort: 1,
        name: 1,
      })
      .limit(Number(limit))
      .skip(Number(skip)),
  ]);

  res.status(200).json({
    total,
    pages: Math.ceil(total / limit),
    items,
  });
};

const create = async (req, res = response) => {
  const data = req.body;
  const item = new Ocio(data);
  try {
    const itemCreated = await item.save();
    deleteKeysByPattern(`ocio:*`);
    return res.status(200).json(itemCreated);
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Por favor, hable con el administrador." });
  }
};

const update = async (req, res = response) => {
  const { id } = req.params;
  const { updatedAt, createdAt, image, uid, ...data } = req.body;

  try {
    const item = await Ocio.findById(id);

    const itemUpdated = await Ocio.findByIdAndUpdate(id, data, {
      new: true,
    });

    deleteKeysByPattern(`ocio:*`);
    return res.status(200).json(itemUpdated);
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
    const item = await Ocio.findById(id);

    if (item.image) {
      removeFileOnServer({ url: item.image, collection: "ocio" });
    }
    deleteKeysByPattern(`ocio:${id}`);
    deleteKeysByPattern(`ocio:list:*`);
    await Ocio.findByIdAndRemove(id);
    res.json({ msg: "El elemento se ha eliminado correctamente." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Por favor, hable con el administrador." });
  }
};

module.exports = { findAll, findOne, findList, create, update, remove };
