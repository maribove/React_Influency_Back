const mongoose = require("mongoose");
const { Schema } = mongoose;

const photoSchema = new Schema(  
  {
    image: String,
    contrato: String,
    title: String,
    desc: String,
    date: String,
    valor: Number,
    situacao: String,
    tags: Array,
    local: String,
    userId: mongoose.ObjectId, 
    userName: String,
    appliedInfluencers: [
      {
        userId: { type: mongoose.ObjectId, ref: "User" }, // Ref o influenciador
        appliedAt: { type: Date, default: Date.now },
      },
    ], 
   
  },
  {
    timestamps: true,
  }
);

Photo = mongoose.model("Photo", photoSchema);

module.exports = Photo;