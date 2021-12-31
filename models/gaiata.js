const { Schema, model } = require("mongoose");

const GaiataSchema = Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
    },
    description_va: {
      type: String,
    },
    subtitle_va: {
      type: String,
    },
    location_va: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

GaiataSchema.methods.toJSON = function () {
  const { _id, ...gaiata } = this.toObject();
  gaiata.uid = _id;
  return gaiata;
};

module.exports = model("Gaiata", GaiataSchema);
