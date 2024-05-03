const mongoose = require("mongoose");
const { Schema } = mongoose;

const photoSchema = new Schema(
  {
    image: String,
    title: String,
    desc: String,
    situacao: String,
    local: String,
    // likes: Array,
    // comments: Array,
    userId: mongoose.ObjectId,
    userName: String,
  },
  {
    timestamps: true,
  }
);

Photo = mongoose.model("Photo", photoSchema);

module.exports = Photo;