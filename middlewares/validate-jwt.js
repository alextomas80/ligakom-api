const { response } = require("express");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const validateJWT = async (req, res = response, next) => {
  const token = req.header("x-token");
  if (!token) {
    return res.status(401).json({ msg: "Token requerido" });
  }

  try {
    const { uid } = jwt.verify(token, process.env.SECRET_JWT_SEED);

    const user = await User.findById(uid);
    if (!user) {
      return res.status(401).json({ msg: "Token de usuario no válido" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ msg: "Token no válido" });
  }
};

module.exports = { validateJWT };
