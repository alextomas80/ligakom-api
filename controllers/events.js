const { response } = require("express");
const readXlsxFile = require("read-excel-file/node");

const path = require("path");
const fs = require("fs");

const cloudinary = require("cloudinary").v2;
cloudinary.config(process.env.CLOUDINARY_URL);

const { Category, Day, Event } = require("../models");
const { removeFileOnServer } = require("../helpers/removeFileOnServer");
const { subirArchivo } = require("../helpers/uploadExcel");
const { deleteKeysByPattern } = require("../database/cache");
const { EVENTS_CACHE_PATTERN } = require("../database/cacheKeys");

const findOne = async (req, res = response) => {
  const { id } = req.params;
  const item = await Event.findById(id);
  res.status(200).json(item);
};

const findByCategory = async (req, res = response) => {
  const { slug } = req.params;
  const category = await Category.findOne({ slug }).select("id");
  const items = await Event.find({ category: category.id }).populate("day");

  const itemsOrdered = items.sort(
    (a, b) => new Date(a.day.date) - new Date(b.day.date)
  );
  return res.status(200).json(itemsOrdered);
};

const create = async (req, res = response) => {
  const data = req.body;
  const event = new Event(data);
  try {
    const item = await event.save();
    deleteKeysByPattern(`${EVENTS_CACHE_PATTERN}*`);
    res.json(item);
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Por favor, hable con el administrador." });
  }
};

const update = async (req, res = response) => {
  const { id } = req.params;

  try {
    const payload = { ...req.body };

    if (!payload.location) {
      payload.location = null;
    }
    if (!payload.category) {
      payload.category = null;
    }

    const event = await Event.findByIdAndUpdate(id, payload, {
      new: true,
    });
    deleteKeysByPattern(`${EVENTS_CACHE_PATTERN}*`);
    res.status(200).json(event);
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Por favor, hable con el administrador!." });
  }
};

const remove = async (req, res = response) => {
  const { id } = req.params;

  try {
    const item = await Event.findById(id);
    if (!item) {
      return res.status(404).send({ msg: "El evento no existe." });
    }
    if (item.image) {
      removeFileOnServer({ url: item.image, collection: "event" });
    }
    deleteKeysByPattern(`${EVENTS_CACHE_PATTERN}*`);
    await Event.findByIdAndRemove(id);
    res.json({ msg: "El evento se ha eliminado correctamente." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Por favor, hable con el administrador." });
  }
};

const uploadExcel = async (req, res = response) => {
  try {
    const filePath = await subirArchivo(req.files, ["xls", "xlsx"]);
    const documents = [];
    readXlsxFile(filePath)
      .then((rows) => {
        const [headers, ...data] = rows;

        data.forEach((row) => {
          const payload = {};
          row.forEach((item, index) => {
            payload[headers[index]] = item;
          });
          documents.push(payload);
        });
        console.log(documents);
        bashUpdate(documents);
      })
      .catch((err) => console.log(err));

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    res.json("Ok");
  } catch (error) {
    console.log(error);
    res.json(error);
  }
};

const bashUpdate = async (documents) => {
  try {
    documents.forEach(async (doc) => {
      doc.time = "" + doc.time;
      if (doc.uid) {
        // actualizar
        const { uid } = doc;
        console.log("Actualizo", uid);
        const item = await Event.findById(uid);
        if (!item) {
          return res.status(404).send({ msg: `El evento ${uid} no existe.` });
        }
        await Event.findByIdAndUpdate(uid, doc, {
          new: true,
        });
      } else {
        // insertar
        const data = doc;
        const item = new Event(data);
        await item.save();
      }
    });
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  findByCategory,
  findOne,
  create,
  update,
  remove,
  uploadExcel,
};
