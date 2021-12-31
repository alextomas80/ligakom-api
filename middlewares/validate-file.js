const { response } = require("express");

const validateFile = (req, res = response, next) => {
  if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
    return res.status(400).json({
      msg: "No se ha recibido ningún archivo para subir.",
    });
  }
  next();
};

module.exports = {
  validateFile,
};
