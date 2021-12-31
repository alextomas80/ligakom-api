const { response } = require("express");
const fieldsStringToArray = require("../helpers/fieldsStringToArray");
const { removeFileOnServer } = require("../helpers/removeFileOnServer");
const { Article } = require("../models");
const { deleteKeysByPattern } = require("../database/cache");
const { BLOG_CACHE_PATTERN } = require("../database/cacheKeys");

const findAll = async (req, res = response) => {
  const { fields = "" } = req.body;
  const { limit = 15, skip = 0 } = req.query;
  const query = {};

  const [total, items] = await Promise.all([
    Article.countDocuments(query),
    Article.find(query)
      .select(fieldsStringToArray(fields))
      .sort("-createdAt")
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

  const item = await Article.findById(id).select(fieldsStringToArray(fields));
  res.status(200).json(item);
};

/**
 * Crear artículo
 */
const create = async (req, res = response) => {
  const article = new Article(req.body);

  try {
    const item = await article.save();
    deleteKeysByPattern(`${BLOG_CACHE_PATTERN}*`);
    res.status(200).json(item);
  } catch (error) {
    res.status(500).send({
      ok: false,
      msg: "Por favor, hable con el administrador.",
    });
  }
};

const update = async (req, res = response) => {
  const { id } = req.params;

  try {
    const item = await Article.findById(id);

    if (!item) {
      return res.status(404).send({ msg: "La noticia no existe." });
    }

    const payload = { ...req.body };

    const article = await Article.findByIdAndUpdate(id, payload, { new: true });
    deleteKeysByPattern(`${BLOG_CACHE_PATTERN}*`);
    res.status(200).json(article);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      msg: "Por favor, hable con el administrador.",
    });
  }
};

const remove = async (req, res = response) => {
  const { id } = req.params;

  try {
    const item = await Article.findById(id);
    if (!item) {
      return res.status(404).send({ msg: "La noticia no existe." });
    }
    if (item.image) {
      removeFileOnServer({ url: item.image, collection: "blog" });
    }
    await Article.findByIdAndRemove(id);
    deleteKeysByPattern(`${BLOG_CACHE_PATTERN}*`);
    res.json({ msg: "La noticia se ha eliminado correctamente." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Por favor, hable con el administrador." });
  }
};

module.exports = { findAll, findOne, create, update, remove };
