const mongoose = require("mongoose");
const { Schema } = mongoose;

const photoSchema = new Schema(
  {
    image: String,
    title: String,
    desc: String,
    date: String,
    situacao: String,
    local: String,
    userId: mongoose.ObjectId, 
    userName: String,
   
  },
  {
    timestamps: true,
  }
);

Photo = mongoose.model("Photo", photoSchema);

module.exports = Photo;