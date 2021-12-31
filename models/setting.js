const { Schema, model } = require("mongoose");

const SettingSchema = Schema(
  {
    votingGaiatasState: {
      type: Boolean,
      default: false,
    },
    votingMascletaesState: {
      type: Boolean,
      default: false,
    },
    programaOficial: {
      type: Boolean,
      default: false,
    },
    votingGaiatasMessage: {
      type: String,
      required: true,
    },
    votingMascletaesMessage: {
      type: String,
      required: true,
    },
    programaOficialMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

SettingSchema.methods.toJSON = function () {
  const { _id, ...item } = this.toObject();
  item.uid = _id;
  return item;
};

module.exports = model("Setting", SettingSchema);
