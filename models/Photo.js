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
    tags: [String],
    local: String,
    userId: mongoose.ObjectId, 
    userName: String,
    appliedInfluencers: [
      {
        userId: { type: mongoose.ObjectId, ref: "User" }, // Ref para o influenciador
        appliedAt: { type: Date, default: Date.now },
      },
    ],
    selectedInfluencer: { 
      userId: { type: mongoose.ObjectId, ref: "User" }, // Ref para o influenciador selecionado
      userName: String, // Nome do influenciador selecionado
      userEmail: String
    },
  },
  {
    timestamps: true,
  }
);

const Photo = mongoose.model("Photo", photoSchema);

module.exports = Photo;
