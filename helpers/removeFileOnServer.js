const cloudinary = require("cloudinary").v2;
cloudinary.config(process.env.CLOUDINARY_URL);

const removeFileOnServer = ({ url, collection }) => {
  if (!url) {
    return false;
  }

  const nombreArr = url.split("/");
  const nombre = nombreArr[nombreArr.length - 1];
  const [public_id] = nombre.split(".");
  cloudinary.uploader.destroy(`${collection}/${public_id}`);
};

module.exports = { removeFileOnServer };
