const { Schema, model } = require("mongoose");

const CategorySchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description_seo: {
      type: String,
    },
    published: {
      type: Boolean,
      default: false,
    },
    ocio: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    // valenciano
    name_va: {
      type: String,
    },
    description_seo_va: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

CategorySchema.methods.toJSON = function () {
  const { __v, _id, uploads, files, file, description_va_seo, ...category } =
    this.toObject();
  category.uid = _id;
  return category;
};

module.exports = model("Category", CategorySchema);
