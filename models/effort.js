const { Schema, model } = require("mongoose");

const EffortSchema = Schema(
  {
    idStrava: {
      type: Number,
      required: true,
      unique: true,
    },
    idSegment: {
      type: Number,
      required: true,
    },
    idAthlete: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    elapsedTime: {
      type: Number,
      required: true,
    },
    movingTime: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    averageCadence: {
      type: Number,
    },
    deviceWatts: {
      type: Boolean,
    },
    averageWatts: {
      type: Number,
    },
    averageHeartrate: {
      type: Number,
    },
    maxHeartrate: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

EffortSchema.methods.toJSON = function () {
  const { _id, ...effort } = this.toObject();
  effort.uid = _id;
  return effort;
};

module.exports = model("Effort", EffortSchema);
