const { Schema, model } = require("mongoose");

const SegmentSchema = Schema(
  {
    idStrava: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    activity_type: {
      type: String,
      required: true,
    },
    distance: {
      type: Number,
      required: false,
    },
    average_grade: {
      type: Number,
      required: true,
    },
    start_latlng: {
      type: [Number, Number],
      required: true,
    },
    end_latlng: {
      type: [Number, Number],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

SegmentSchema.methods.toJSON = function () {
  const { _id, ...segment } = this.toObject();
  segment.uid = _id;
  return segment;
};

module.exports = model("Segment", SegmentSchema);
