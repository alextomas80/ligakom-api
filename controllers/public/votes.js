const { response } = require("express");

const { Vote } = require("../models");

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

async function checkUserHasNotVoted({ type, idUser, idVoted }) {
  const query =
    type === "gaiata" ? { type, idUser } : { type, idUser, idVoted };
  const item = await Vote.findOne(query);
  return !!item;
}

module.exports = {
  setVote,
};
