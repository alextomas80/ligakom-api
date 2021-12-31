const { Schema, model } = require("mongoose");

const VoteSchema = Schema(
  {
    type: {
      type: String,
      default: false,
      enum: ["gaiata", "mascleta"],
    },
    idUser: {
      type: String,
      required: true,
    },
    idVoted: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

VoteSchema.methods.toJSON = function () {
  const { _id, ...item } = this.toObject();
  item.uid = _id;
  return item;
};

module.exports = model("Vote", VoteSchema);
