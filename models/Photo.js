const mongoose = require("mongoose");
const { Schema } = mongoose;

const photoSchema = new Schema(
  {
    image: String,
    title: String,
    desc: String,
    date: String,
    situacao: String,
    tags: Array,
    local: String,
    userId: mongoose.ObjectId, 
    userName: String,
    atuacao: String,
   
  },
  {
    timestamps: true,
  }
);

Photo = mongoose.model("Photo", photoSchema);

module.exports = Photo;