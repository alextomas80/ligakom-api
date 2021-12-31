const { Schema, model } = require("mongoose");

const EventSchema = Schema(
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
    pinned: {
      type: Boolean,
      default: false,
    },
    endOfDay: {
      type: Boolean,
      default: false,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: "Location",
    },
    day: {
      type: Schema.Types.ObjectId,
      ref: "Day",
      required: true,
    },
    // sort: {
    //   type: Number,
    // },

    // files: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "Upload",
    //   },
    // ],
    time: {
      type: String,
      required: true,
    },
    // timestamp: {
    //   type: Number,
    //   required: true,
    // },
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

EventSchema.methods.toJSON = function () {
  const { __v, _id, uploads, files, file, sort, timestamp, ...event } =
    this.toObject();
  event.uid = _id;
  return event;
};

module.exports = model("Event", EventSchema);
