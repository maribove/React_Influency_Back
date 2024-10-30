const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: String,
    email: String,
    role: {
      type: String,
      enum: ['admin', 'Influenciador', 'Empresa'], // Valores permitidos
    },
    password: String,
    profileImage: String,
    portfolio: String,
    bio: String,
    interests: [String],
    instagram: String,
    emailcontato: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date, 
    telefone: String,
    usuario: String,
  },
  {
    timestamps: true,
  }
);

User = mongoose.model("User", userSchema);

module.exports = User;
