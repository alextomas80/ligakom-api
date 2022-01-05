const { response } = require("express");
// const fieldsStringToArray = require("../helpers/fieldsStringToArray");
// const { removeFileOnServer } = require("../helpers/removeFileOnServer");
const { League, Segment, User } = require("../models");
const { getSegmentInformation, getCurrentUser } = require("../services/strava");
// const { deleteKeysByPattern } = require("../database/cache");
// const { BLOG_CACHE_PATTERN } = require("../database/cacheKeys");

const findAll = async (req, res = response) => {
  const { fields = "" } = req.body;
  const { limit = 15, skip = 0 } = req.query;
  const query = {};

  const [total, items] = await Promise.all([
    League.countDocuments(query),
    League.find(query)
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
  const { id } = req.params;

  const league = await League.findById(id)
    .populate("users")
    .populate("segments");

  return res.status(200).json(league);
};

const create = async (req, res = response) => {
  const access_token = req.headers.authorization.split("Bearer ")[1];

  try {
    const userLogged = await getCurrentUser(access_token);

    const league = new League(req.body);
    const user = await User.findOne({ idStrava: userLogged.id });
    league.athletes = [user._id];
    league.owner = user._id;

    const newLeague = await league.save();
    return res.status(200).json(newLeague);
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      ok: false,
      msg: "Por favor, hable con el administrador.",
    });
  }
};

const update = async (req, res = response) => {
  const { id } = req.params;
  console.log("cucu");
  try {
    const payload = { ...req.body };
    console.log(payload);
    // const segments = await Segment.find({
    //   idStrava: { $in: [11594329] },
    // });
    // return res.status(200).json(segments);

    const updatedLeague = await League.findByIdAndUpdate(id, payload, {
      new: true,
    });

    return res.status(200).json(updatedLeague);
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      msg: "Por favor, hable con el administrador.",
    });
  }
};

const remove = async (req, res = response) => {
  const { id } = req.params;

  try {
    await League.findByIdAndRemove(id);
    return res.status(200).json({ msg: "La liga ha sido borrada con éxito." });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ msg: "Por favor, hable con el administrador." });
  }
};

const addSegment = async (req, res = response) => {
  const access_token = req.headers.authorization.split("Bearer ")[1];

  const { id, sid } = req.params;
  const idStrava = +sid;

  try {
    // obtenemos la información del segmento
    const segmentInfo = await getSegmentInformation({ sid, access_token });
    await Segment.updateOne({ idStrava }, { ...segmentInfo }, { upsert: true });

    const { segments: segmentsLeague } = await League.findById(id)
      .select("segments")
      .populate("segments");

    const segmentsLeagueArray = segmentsLeague.map((segment) => segment._id);

    const segmentAlreadyExist = segmentsLeague.find(
      (s) => s.idStrava === idStrava
    );

    if (segmentAlreadyExist) {
      return res
        .status(200)
        .json({ msg: "El segmento ya está está incluido en la liga" });
    }

    const segment = await Segment.findOne({ idStrava: +sid });

    const updatedLeague = await League.findByIdAndUpdate(
      id,
      {
        segments: [...segmentsLeagueArray, segment._id],
      },
      {
        new: true,
      }
    );

    return res.status(200).json(updatedLeague);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ msg: "Por favor, hable con el administrador." });
  }
};

const removeSegment = async (req, res = response) => {
  const { id, sid } = req.params;

  const idStrava = +sid;

  const { segments } = await League.findById(id)
    .select("segments")
    .populate("segments");

  const segment = await Segment.findOne({ idStrava }).select("_id");

  const segmentsToMantain = segments
    .filter((s) => s._id.toString() !== segment._id.toString())
    .map((s) => s._id);

  const updatedLeague = await League.findByIdAndUpdate(
    id,
    {
      segments: segmentsToMantain,
    },
    {
      new: true,
    }
  );

  return res.status(200).json(updatedLeague);
};

module.exports = {
  addSegment,
  create,
  findAll,
  findOne,
  remove,
  removeSegment,
  update,
};
