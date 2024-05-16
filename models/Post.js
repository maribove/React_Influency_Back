const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema(
  {
    image: String,
    publicacao: String,
    likes: Array,
    comments: Array,
    userId: mongoose.ObjectId,
    userName: String,
  },
  {
    timestamps: true,
  }
);

Post = mongoose.model("Post", postSchema);

module.exports = Post;