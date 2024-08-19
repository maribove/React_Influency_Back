const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: String,
    email: String,
    password: String,
    type: String,
    profileImage: String,
    portfolio: String,
    bio: String,
    interests: [String],  
  },
  {
    timestamps: true,
  }
);

User = mongoose.model("User", userSchema);

module.exports = User;