const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema(
  {
    image: String,
    publicacao: String,
    likes: Array,
    comments: [
      {
        comment: String,
        userName: String,
        userImage: String,
        userId: mongoose.ObjectId,
      },
    ],
    userId: mongoose.ObjectId,
    userName: String,
    profileImage: String, 
  },
  {
    timestamps: true,
  }
);

Post = mongoose.model("Post", postSchema);

module.exports = Post;
