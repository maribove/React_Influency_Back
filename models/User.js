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
    resetPasswordToken: String, // redefinição de senha
    resetPasswordExpires: Date, // expiração do token
  },
  {
    timestamps: true,
  }
);

User = mongoose.model("User", userSchema);

module.exports = User;