// const multer = require("multer");
// console.log("multerrr");
// // -> Multer Upload Storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     console.log("cucu", file);
//     cb(null, __dirname + "/public/uploads");
//   },
//   filename: (req, file, cb) => {
//     console.log(req);
//     cb(null, Date.now() + "--" + file.originalname);
//   },
// });

// module.exports = multer({ storage: storage });

const path = require("path");
const { v4: uuidv4 } = require("uuid");

const subirArchivo = (
  files,
  extensionesValidas = ["png", "jpg", "jpeg", "gif"],
  carpeta = ""
) => {
  return new Promise((resolve, reject) => {
    const { excel } = files;
    const nombreCortado = excel.name.split(".");
    const extension = nombreCortado[nombreCortado.length - 1];

    // Validar la extension
    if (!extensionesValidas.includes(extension)) {
      return reject(
        `La extensión ${extension} no es permitida - ${extensionesValidas}`
      );
    }

    const nombreTemp = uuidv4() + "." + extension;
    const uploadPath = path.join(__dirname, "../uploads/", carpeta, nombreTemp);

    excel.mv(uploadPath, (err) => {
      if (err) {
        reject(err);
      }

      resolve(uploadPath);
    });
  });
};

module.exports = {
  subirArchivo,
};
