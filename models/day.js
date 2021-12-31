const { Schema, model } = require("mongoose");

const DaySchema = Schema(
  {
    published: {
      type: Boolean,
    },
    date: {
      type: Date,
      required: true,
    },

    title_seo: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    description_seo: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },

    // valenciano fields
    title_seo_va: {
      type: String,
    },
    description_va: {
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

DaySchema.methods.toJSON = function () {
  const { __v, _id, uploads, files, ...day } = this.toObject();
  delete day.timestamp;
  day.uid = _id;
  return day;
};

module.exports = model("Day", DaySchema);
