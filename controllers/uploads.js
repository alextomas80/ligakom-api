const { response } = require("express");
const cloudinary = require("cloudinary").v2;
cloudinary.config(process.env.CLOUDINARY_URL);

const { removeFileOnServer } = require("../helpers/removeFileOnServer");
const {
  Article,
  Category,
  Day,
  Event,
  Gaiata,
  Location,
  Ocio,
} = require("../models");

const update = async (req, res = response) => {
  const { id, collection } = req.params;

  let model;

  switch (collection) {
    case "days":
      model = await Day.findById(id);
      if (!model) {
        return res
          .status(400)
          .json({ msg: `No existe día festivo con el id ${id}` });
      }
      break;
    case "event":
      model = await Event.findById(id);
      if (!model) {
        return res
          .status(400)
          .json({ msg: `No existe evento con el id ${id}` });
      }
      break;
    case "categories":
      model = await Category.findById(id);
      if (!model) {
        return res
          .status(400)
          .json({ msg: `No existe categoría con el id ${id}` });
      }
      break;
    case "blog":
      model = await Article.findById(id);
      if (!model) {
        return res
          .status(400)
          .json({ msg: `No existe noticia con el id ${id}` });
      }
      break;
    case "locations":
      model = await Location.findById(id);
      if (!model) {
        return res
          .status(400)
          .json({ msg: `No existe ubicación con el id ${id}` });
      }
      break;
    case "ocio":
      model = await Ocio.findById(id);
      if (!model) {
        return res.status(400).json({ msg: `No existe ocio con el id ${id}` });
      }
      break;
    case "gaiatas":
      model = await Gaiata.findById(id);
      if (!model) {
        return res
          .status(400)
          .json({ msg: `No existe gaiata con el id ${id}` });
      }
      break;

    default:
      return res.status(500).json({ msg: "Modelo no encontrado." });
  }

  // Limpiar imágenes previas
  if (model.image) {
    removeFileOnServer({ url: model.image, collection });
  }

  const { tempFilePath } = req.files.file;
  const { secure_url } = await cloudinary.uploader.upload(tempFilePath, {
    folder: collection,
  });
  model.image = secure_url;

  await model.save();

  res.json(model);
};

const removeFile = async (req, res = response) => {
  const { id, collection } = req.params;

  let model;

  switch (collection) {
    case "days":
      model = await Day.findById(id);
      if (!model) {
        return res
          .status(400)
          .json({ msg: `No existe día festivo con el id ${id}` });
      }
      break;
    case "event":
      model = await Event.findById(id);
      if (!model) {
        return res
          .status(400)
          .json({ msg: `No existe evento con el id ${id}` });
      }
      break;
    case "categories":
      model = await Category.findById(id);
      if (!model) {
        return res
          .status(400)
          .json({ msg: `No existe categoría con el id ${id}` });
      }
      break;
    case "blog":
      model = await Article.findById(id);
      if (!model) {
        return res
          .status(400)
          .json({ msg: `No existe noticia con el id ${id}` });
      }
      break;
    case "locations":
      model = await Location.findById(id);
      if (!model) {
        return res
          .status(400)
          .json({ msg: `No existe ubicación con el id ${id}` });
      }
      break;
    case "ocio":
      model = await Ocio.findById(id);
      if (!model) {
        return res.status(400).json({ msg: `No existe ocio con el id ${id}` });
      }
      break;
    case "gaiatas":
      model = await Gaiata.findById(id);
      if (!model) {
        return res
          .status(400)
          .json({ msg: `No existe gaiata con el id ${id}` });
      }
      break;

    default:
      return res.status(500).json({ msg: "Modelo no encontrado." });
  }

  if (model.image) {
    removeFileOnServer({ url: model.image, collection });
  }

  model.image = null;

  await model.save();
  res.json(model);
};

module.exports = { update, removeFile };
