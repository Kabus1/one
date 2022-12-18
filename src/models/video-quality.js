const mongoose = require("mongoose");

const { Schema } = mongoose;

const VideoQuality = Schema({
  title: { type: String, required: true },
  Description: { type: String, required: true },
  HD: { type: String, required: true },
  SD: { type: String, required: true },
  receipt: { type: String },
});

const Video = mongoose.model("Video", VideoQuality);
module.exports = Video;
