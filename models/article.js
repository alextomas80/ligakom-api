const { Schema, model } = require("mongoose");

const ArticleSchema = Schema(
  {
    published: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
    },
    intro: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    // valenciano fields
    title_va: {
      type: String,
    },
    intro_va: {
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

ArticleSchema.methods.toJSON = function () {
  const { __v, _id, uploads, files, file, ...article } = this.toObject();
  article.uid = _id;
  return article;
};

module.exports = model("Article", ArticleSchema);
