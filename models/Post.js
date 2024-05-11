const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema(
  {
    publicacao: String,
    // imagem: String,
    likes: Array,
    comments: Array,
    userId: mongoose.ObjectId,
    userName: String,
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;