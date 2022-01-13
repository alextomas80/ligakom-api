const { Schema, model } = require("mongoose");

const LeagueSchema = Schema(
  {
    name: {
      type: String,
      required: true,
      // unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
      required: false,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    athletes: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    segments: {
      type: [Schema.Types.ObjectId],
      ref: "Segment",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

LeagueSchema.methods.toJSON = function () {
  const { _id, ...league } = this.toObject();
  league.uid = _id;
  return league;
};

module.exports = model("League", LeagueSchema);
