const { Schema, model } = require("mongoose");

const LocationSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    name_va: {
      type: String,
    },
    description: {
      type: String,
    },
    description_va: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

LocationSchema.methods.toJSON = function () {
  const { __v, _id, uploads, files, file, description_va_seo, ...location } =
    this.toObject();
  location.uid = _id;
  return location;
};

module.exports = model("Location", LocationSchema);
