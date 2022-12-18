const mongoose = require("mongoose");

const { Schema } = mongoose;

const MovieSchema = Schema({
  amount: { type: Number },
  description: { type: String },
  receipt: { type: String },
  created: { type: Date },
});

const Movie = mongoose.model("Movie", MovieSchema);
module.exports = Movie;
