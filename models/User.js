const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: String,
    email: String,
    role: {
      type: String,
      enum: ['admin', 'Influenciador', 'Empresa'], // Define os valores permitidos para o campo role
       
    },
    password: String,
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