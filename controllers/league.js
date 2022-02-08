const { response } = require("express");
const { orderBy } = require("lodash");

const { getOverall } = require("../services/League/getOverall");

const overall = async (req, res = response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(404).json("El ID es requerido.");
  }

  try {
    const overallResponse = await getOverall(id);
    const overallOrdered = orderBy(overallResponse, ["points"], ["desc"]);

    return res.status(200).json(overallOrdered);
  } catch (error) {
    return res.status(500).json(error.toString());
  }
};

module.exports = { overall };
