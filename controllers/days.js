const { response } = require("express");
const getUnixTime = require("date-fns/getUnixTime");
const parseISO = require("date-fns/parseISO");

const { Day, Event } = require("../models");
const fieldsStringToArray = require("../helpers/fieldsStringToArray");
const { removeFileOnServer } = require("../helpers/removeFileOnServer");
const { deleteKeysByPattern } = require("../database/cache");

const findAll = async (req, res = response) => {
  const { fields = "" } = req.body;
  const { limit = 10, skip = 0 } = req.query;
  const query = {};

  const [total, items] = await Promise.all([
    Day.countDocuments(query),
    Day.find(query)
      .select(fieldsStringToArray(fields))
      .sort("date")
      .limit(Number(limit))
      .skip(Number(skip)),
  ]);

  res.status(200).json({
    total,
    pages: Math.ceil(total / limit),
    items,
  });
};

const findOne = async (req, res = response) => {
  const { fields = "" } = req.body;
  const { id } = req.params;

  const item = await Day.findById(id).select(fieldsStringToArray(fields));
  res.status(200).json(item);
};

const findEvents = async (req, res = response) => {
  const { id } = req.params;
  const { fields = "" } = req.body;
  const { limit = 50, skip = 0 } = req.query;
  const query = { day: id };

  const [total, items] = await Promise.all([
    Event.countDocuments(query),
    Event.find(query)
      .select(fieldsStringToArray(fields))
      .sort({
        endOfDay: 1,
        time: 1,
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
  const day = new Day(req.body);

  try {
    const itemCreated = await day.save();
    deleteKeysByPattern(`days:*`);
    res.json(itemCreated);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      msg: "Por favor, hable con el administrador. No se ha podido crear el día.",
    });
  }
};

const update = async (req, res = response) => {
  const { id } = req.params;
  const { updatedAt, createdAt, image, uid, ...data } = req.body;

  try {
    const item = await Day.findById(id);

    if (!item) {
      return res.status(404).send({ msg: "El día no existe." });
    }

    const day = await Day.findByIdAndUpdate(id, data, {
      new: true,
    });

    deleteKeysByPattern(`days:*`);
    res.status(200).json(day);
  } catch (error) {
    res.status(500).send({ msg: "Por favor, hable con el administrador." });
  }
};

const remove = async (req, res = response) => {
  const { id } = req.params;

  try {
    const item = await Day.findById(id);
    if (!item) {
      return res.status(404).send({ msg: "El día no existe." });
    }
    if (item.image) {
      removeFileOnServer({ url: item.image, collection: "days" });
    }
    await Day.findByIdAndRemove(id);
    deleteKeysByPattern(`days:*`);

    res.json({ msg: "El día se ha eliminado correctamente." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Por favor, hable con el administrador." });
  }
};

module.exports = { findAll, findOne, findEvents, create, update, remove };
