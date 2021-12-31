const { Schema, model } = require("mongoose");

const OcioSchema = Schema(
  {
    published: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    sort: {
      type: Number,
      default: 50,
    },
    // valenciano
    name_va: {
      type: String,
    },
    description_va: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

OcioSchema.methods.toJSON = function () {
  const { _id, ...item } = this.toObject();
  item.uid = _id;
  return item;
};

module.exports = model("Ocio", OcioSchema);
