const { response } = require("express");
const mongoose = require("mongoose");

const {
  Day,
  Event,
  Category,
  Article,
  Ocio,
  Setting,
  Gaiata,
  Vote,
} = require("../models");
const { setAsync, getAsync } = require("../database/cache");
const fieldsStringToArray = require("../helpers/fieldsStringToArray");
const {
  SETTINGS_CACHE_PATTERN,
  GAIATAS_CACHE_PATTERN,
  BLOG_CACHE_PATTERN,
  EVENTS_CACHE_PATTERN,
} = require("../database/cacheKeys");

const CACHE_TIME = process.env.CACHE_TIME;

const findDays = async (req, res = response) => {
  const { fields = "" } = req.body;
  const { limit = 10, skip = 0 } = req.query;
  const query = { published: true };

  try {
    const getRes = await getAsync(`days:${limit}:${skip}`);
    if (getRes) {
      console.log(` ☁️  Days ${limit}:${skip}`);
      return res.status(200).json(JSON.parse(getRes));
    }
    console.log(` 🗄  Days ${limit}:${skip}`);

    const [total, items] = await Promise.all([
      Day.countDocuments(query),
      Day.find(query)
        .select(fieldsStringToArray(fields))
        .sort("date")
        .limit(Number(limit))
        .skip(Number(skip)),
    ]);
    const responseDays = {
      total,
      pages: Math.ceil(total / limit),
      items,
    };

    res.status(200).json(responseDays);
    await setAsync(
      `days:${limit}:${skip}`,
      JSON.stringify(responseDays),
      "EX",
      process.env.CACHE_TIME
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const findOneDay = async (req, res = response) => {
  const { id } = req.params;

  const isMongoId = mongoose.Types.ObjectId.isValid(id);

  const { fields = "" } = req.body;

  const query = !isMongoId ? { published: true } : { published: true, _id: id };

  if (!isMongoId) {
    const searchDay = await Day.findOne({ slug: id });
    query._id = String(searchDay._id);
  }

  const [item] = await Day.find(query)
    .select(fieldsStringToArray(fields))
    .limit(1);
  if (item) {
    return res.status(200).json(item);
  } else {
    return res.status(404).json({ mdg: `Día con el id ${id} no encontrado` });
  }
};

const findEvents = async (req, res = response) => {
  const { id } = req.params;

  const isMongoId = mongoose.Types.ObjectId.isValid(id);

  const { fields = "" } = req.body;
  const { limit = 10, skip = 0 } = req.query;
  const cacheKey = `${EVENTS_CACHE_PATTERN}:LIST:${id}:${limit}:${skip}`;

  try {
    const getRes = await getAsync(cacheKey);
    if (getRes) {
      console.log(` ☁️  ${cacheKey}`);
      return res.status(200).json(JSON.parse(getRes));
    }
    console.log(` 🗄  ${cacheKey}`);

    const query = !isMongoId
      ? { published: true }
      : { published: true, day: id };

    if (!isMongoId) {
      const searchDay = await Day.findOne({ slug: id });
      query.day = String(searchDay._id);
    }

    const [total, items] = await Promise.all([
      Event.countDocuments(query),
      Event.find(query)
        .select(fieldsStringToArray(fields))
        .populate("day")
        .populate("category")
        .populate("location")
        .sort({
          endOfDay: 1,
          time: 1,
          name: 1,
        })
        .skip(Number(skip))
        .limit(Number(limit)),
    ]);

    const pages = Math.ceil(total / limit);
    const responsePaginated = {
      total,
      pages,
      hasNextPage:
        items.length < limit ||
        skip / limit === pages ||
        Number(skip) + Number(limit) === total
          ? false
          : true,
      items,
    };
    await setAsync(
      cacheKey,
      JSON.stringify(responsePaginated),
      "EX",
      CACHE_TIME
    );
    return res.status(200).json(responsePaginated);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const findOneEvent = async (req, res = response) => {
  const { id } = req.params;
  const isMongoId = mongoose.Types.ObjectId.isValid(id);
  const cacheKey = `${EVENTS_CACHE_PATTERN}:${id}`;

  try {
    const getRes = await getAsync(cacheKey);
    if (getRes) {
      console.log(` ☁️  ${cacheKey}`);
      return res.status(200).json(JSON.parse(getRes));
    }

    console.log(` 🗄  ${cacheKey}`);

    const query = !isMongoId ? { published: true } : { published: true, id };

    if (!isMongoId) {
      const searchEvent = await Event.findOne({ slug: id });
      query.id = String(searchEvent._id);
    }

    const event = await Event.findById(query.id)
      .populate({
        path: "day",
        select: "date slug",
      })
      .populate({
        path: "category",
        select: "name name_va",
      })
      .populate({
        path: "location",
        select: "name name_va latitude longitude",
      })
      .where("published", query.published);
    await setAsync(
      cacheKey,
      JSON.stringify(event),
      "EX",
      process.env.CACHE_TIME
    );

    return res.status(200).json(event);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const findCategoryEvents = async (req, res = response) => {
  const { fields = "" } = req.body;
  const { slug } = req.params;
  const cacheKey = `${EVENTS_CACHE_PATTERN}:LIST:${slug}`;

  try {
    const getRes = await getAsync(cacheKey);
    if (getRes) {
      console.log(` ☁️  ${cacheKey}`);
      return res.status(200).json(JSON.parse(getRes));
    }
    console.log(` 🗄  ${cacheKey}`);

    const category = await Category.findOne({ slug }).select("id");

    if (!category) {
      return res.status(404).json({ msg: `No existe la categoría ${slug}` });
    }

    const items = await Event.find()
      .select(fieldsStringToArray(fields))
      .where("published", true)
      .where("category", category.id)
      .populate({ path: "day", select: "date slug" })
      .populate({ path: "category", select: "name name_va" })
      .populate({ path: "location", select: "name name_va" });

    const itemsOrdered = items.sort(
      (a, b) => new Date(a.day.date) - new Date(b.day.date)
    );
    await setAsync(
      cacheKey,
      JSON.stringify(itemsOrdered),
      "EX",
      process.env.CACHE_TIME
    );
    return res.status(200).json(itemsOrdered);
  } catch (error) {
    console.log(error);
    return res
      .status(404)
      .json({ msg: `No se han encontrado eventos para la categoría ${slug}` });
  }
};

const findArticles = async (req, res = response) => {
  const { fields = "" } = req.body;
  const { limit = 10, skip = 0 } = req.query;
  const query = { published: true };
  const cacheKey = `${BLOG_CACHE_PATTERN}:${limit}:${skip}`;

  try {
    const getRes = await getAsync(cacheKey);
    if (getRes) {
      console.log(` ☁️  ${cacheKey}`);
      return res.status(200).json(JSON.parse(getRes));
    }
    console.log(` 🗄  ${cacheKey}`);

    const [total, items] = await Promise.all([
      Article.countDocuments(query),
      Article.find(query)
        .select(fieldsStringToArray(fields))
        .sort({
          createdAt: -1,
        })
        .skip(Number(skip))
        .limit(Number(limit)),
    ]);

    const pages = Math.ceil(total / limit);
    const responsePaginated = {
      total,
      pages,
      hasNextPage:
        items.length < limit ||
        skip / limit === pages ||
        Number(skip) + Number(limit) === total
          ? false
          : true,
      items,
    };
    await setAsync(
      cacheKey,
      JSON.stringify(responsePaginated),
      "EX",
      process.env.CACHE_TIME
    );
    return res.status(200).json(responsePaginated);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const findArticlesPaths = async (req, res = response) => {
  const query = { published: true };
  const cacheKey = `${BLOG_CACHE_PATTERN}:PATHS`;

  try {
    const getRes = await getAsync(cacheKey);
    if (getRes) {
      console.log(` ☁️  ${cacheKey}`);
      return res.status(200).json(JSON.parse(getRes));
    }
    console.log(` 🗄  ${cacheKey}`);

    const items = await Article.find(query).select("slug").sort({
      createdAt: -1,
    });

    await setAsync(
      cacheKey,
      JSON.stringify(items),
      "EX",
      process.env.CACHE_TIME
    );
    return res.status(200).json(items);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const findEventsPaths = async (req, res = response) => {
  const query = { published: true };
  const cacheKey = `${EVENTS_CACHE_PATTERN}:PATHS`;

  try {
    const getRes = await getAsync(cacheKey);
    if (getRes) {
      console.log(` ☁️  ${cacheKey}`);
      return res.status(200).json(JSON.parse(getRes));
    }
    console.log(` 🗄  ${cacheKey}`);

    const items = await Event.find(query)
      .select("slug")
      .populate({ path: "day", select: "slug" });

    await setAsync(
      cacheKey,
      JSON.stringify(items),
      "EX",
      process.env.CACHE_TIME
    );
    return res.status(200).json(items);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const findOneArticle = async (req, res = response) => {
  const { id } = req.params;
  const isMongoId = mongoose.Types.ObjectId.isValid(id);
  const cacheKey = `${BLOG_CACHE_PATTERN}:${id}`;

  try {
    const getRes = await getAsync(cacheKey);

    if (getRes) {
      console.log(` ☁️  ${cacheKey}`);
      return res.status(200).json(JSON.parse(getRes));
    }

    console.log(` 🗄  ${cacheKey}`);

    const query = !isMongoId
      ? { published: true }
      : { published: true, _id: id };

    if (!isMongoId) {
      const searchEvent = await Article.findOne({ slug: id });
      query._id = String(searchEvent._id);
    }

    const [item] = await Article.find(query).limit(1);

    await setAsync(
      cacheKey,
      JSON.stringify(item),
      "EX",
      process.env.CACHE_TIME
    );

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const findOcio = async (req, res = response) => {
  const { fields = "" } = req.body;
  const { limit = 10, skip = 0 } = req.query;
  const query = { ocio: true };

  try {
    const getRes = await getAsync(`ocio:${limit}:${skip}`);
    if (getRes) {
      console.log(` ☁️  Ocio ${limit}:${skip}`);
      return res.status(200).json(JSON.parse(getRes));
    }
    console.log(` 🗄  Ocio ${limit}:${skip}`);

    const [total, items] = await Promise.all([
      Category.countDocuments(query),
      Category.find(query)
        .select(fieldsStringToArray(fields))
        .sort("name")
        .limit(Number(limit))
        .skip(Number(skip)),
    ]);
    const responseOcio = {
      total,
      pages: Math.ceil(total / limit),
      items,
    };

    res.status(200).json(responseOcio);
    await setAsync(
      `ocio:${limit}:${skip}`,
      JSON.stringify(responseOcio),
      "EX",
      process.env.CACHE_TIME
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const findOneOcio = async (req, res = response) => {
  const { fields = "" } = req.body;
  const { id } = req.params;
  const cacheKey = `ocio:${id}`;

  try {
    const getRes = await getAsync(cacheKey);
    if (getRes) {
      console.log(` ☁️  Ocio >> ${id}`);
      return res.status(200).json(JSON.parse(getRes));
    }

    console.log(` 🗄  Ocio >> ${id}`);

    const item = await Ocio.findById(id)
      .select(fieldsStringToArray(fields))
      .populate("category");

    await setAsync(cacheKey, JSON.stringify(item), "EX", CACHE_TIME);
    return res.status(200).json(item);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const findOcioCategory = async (req, res = response) => {
  const { fields = "" } = req.body;
  const { id } = req.params;
  const query = { category: id };
  const { limit = 10, skip = 0 } = req.query;
  const cacheKey = `ocio:${id}:${limit}:${skip}`;

  try {
    const getRes = await getAsync(cacheKey);
    if (getRes) {
      console.log(` ☁️  Ocio >> ${cacheKey}`);
      return res.status(200).json(JSON.parse(getRes));
    }

    console.log(` 🗄  Ocio >> ${cacheKey}`);

    const [total, items] = await Promise.all([
      Ocio.countDocuments(query),
      Ocio.find(query)
        .select(fieldsStringToArray(fields))
        .sort("sort,name")
        .limit(Number(limit))
        .skip(Number(skip)),
    ]);
    const responseOcio = {
      total,
      pages: Math.ceil(total / limit),
      items,
    };
    await setAsync(cacheKey, JSON.stringify(responseOcio), "EX", CACHE_TIME);

    return res.status(200).json(responseOcio);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const getSettings = async (req, res = response) => {
  const cacheKey = SETTINGS_CACHE_PATTERN;

  try {
    const getRes = await getAsync(cacheKey);
    if (getRes) {
      return res.status(200).json(JSON.parse(getRes));
    }
    const [settings] = await Setting.find().limit(1).skip(0);
    await setAsync(cacheKey, JSON.stringify(settings), "EX", CACHE_TIME);
    return res.status(200).json(settings);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const findGaiatas = async (req, res = response) => {
  const cacheKey = GAIATAS_CACHE_PATTERN;

  try {
    const getRes = await getAsync(cacheKey);
    if (getRes) {
      console.log(` ☁️  ${cacheKey}`);
      return res.status(200).json(JSON.parse(getRes));
    }

    console.log(` 🗄  ${cacheKey}`);

    const gaiatas = await Gaiata.find().select().sort("order");
    await setAsync(cacheKey, JSON.stringify(gaiatas), "EX", CACHE_TIME);
    return res.status(200).json(gaiatas);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const findOneGaiata = async (req, res = response) => {
  const { fields = "" } = req.body;
  const { id } = req.params;
  const cacheKey = `${GAIATAS_CACHE_PATTERN}:${id}`;

  try {
    const getRes = await getAsync(cacheKey);
    if (getRes) {
      console.log(` ☁️  ${cacheKey}`);
      return res.status(200).json(JSON.parse(getRes));
    }

    console.log(` 🗄  ${cacheKey}`);

    const item = await Gaiata.findById(id).select(fieldsStringToArray(fields));

    await setAsync(cacheKey, JSON.stringify(item), "EX", CACHE_TIME);
    return res.status(200).json(item);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const setVote = async (req, res = response) => {
  const params = req.params;
  const { value } = req.body;

  const payload = {
    ...params,
    value,
  };

  if (await checkUserHasNotVoted(payload)) {
    return res
      .status(200)
      .json({ msg: "!Vaya! Parece que ya habías votado 😜" });
  }

  const item = new Vote(payload);
  try {
    await item.save();
    return res
      .status(200)
      .json({ msg: "¡Genial! Tu voto se ha guardado correctamente 🙌🏻" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Por favor, hable con el administrador." });
  }
};

const getVote = async (req, res = response) => {
  const params = req.params;
  const query = { ...params };
  try {
    const [vote] = await Vote.find(query).limit(1);
    return res.status(200).json(vote || null);
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Por favor, hable con el administrador." });
  }
};

async function checkUserHasNotVoted({ type, idUser, idVoted }) {
  const query =
    type === "gaiata" ? { type, idUser } : { type, idUser, idVoted };
  const item = await Vote.findOne(query);
  return !!item;
}

module.exports = {
  findDays,
  findOneDay,
  findEvents,
  findOneEvent,
  findCategoryEvents,
  findArticles,
  findArticlesPaths,
  findOneArticle,
  findOcio,
  findOneOcio,
  findOcioCategory,
  getSettings,
  findGaiatas,
  findOneGaiata,
  setVote,
  getVote,
  findEventsPaths,
};
