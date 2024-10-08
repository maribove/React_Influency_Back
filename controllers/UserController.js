const User = require("../models/User");

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

const jwtSecret = process.env.JWT_SECRET;

// Generate user token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d", // Expira em 1 dia
  });
};

// Register user and sign in
const register = async (req, res) => {
  const { name, email, password, role, interests } = req.body;

  // check if user exists
  const user = await User.findOne({ email });

  if (user) {
    res.status(422).json({ errors: ["E-mail já está sendo utilizado. Por favor, utilize outro e-mail!"] });
    return;
  }
  
  // Generate password hash
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await User.create({
    name,
    email,
    role,
    interests,
    password: passwordHash,
  });

  // If user was created sucessfully, return the token
  if (!newUser) {
    res.status(422).json({
      errors: ["Houve um erro, por favor tente novamente mais tarde."],
    });
    return;
  }

   // Gere o token JWT para o novo usuário
  const token = generateToken(newUser._id);

  // Retorne o token e os dados do usuário
  return res.status(201).json({
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    interests: newUser.interests,
    token: token,
  });
};

// Get logged in user
const getCurrentUser = async (req, res) => {
  const user = req.user;

  res.status(200).json(user);
};

// Sign user in
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // Check if user exists
  if (!user) {
    res.status(404).json({ errors: ["Usuário não encontrado! Insira um email válido"] });
    return;
  }

  // Check if password matches
  if (!(await bcrypt.compare(password, user.password))) {
    res.status(422).json({ errors: ["Senha inválida! Tente novamente."] });
    return;
  }

  const token = generateToken(user._id);
  console.log("Token no Login:", token); // Verifique o token gerado

  // Return user with token
  res.status(200).json({
    _id: user._id,
    role: user.role,
    profileImage: user.profileImage,
    token: token,
  });

};

// Update user
// Update user
const update = async (req, res) => {
  const { name, password, bio, interests } = req.body;

  let profileImage = null;
  let portfolio = null;

  if (req.files) {
    if (req.files.profileImage) {
      profileImage = req.files.profileImage[0].filename;
    }
    if (req.files.portfolio) {
      portfolio = req.files.portfolio[0].filename;
    }
  }

  const reqUser = req.user;
  const user = await User.findById(new mongoose.Types.ObjectId(reqUser._id)).select("-password");

  if (!user) {
    return res.status(404).json({ errors: ["Usuário não encontrado!"] });
  }

  if (name) user.name = name;
  if (password) {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    user.password = passwordHash;
  }
  if (bio) user.bio = bio;
  if (interests) user.interests = interests;
  if (profileImage) user.profileImage = profileImage;
  if (portfolio) user.portfolio = portfolio;

  await user.save();

  res.status(200).json(user);
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  // Verificar se o ID é um ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ errors: ["ID inválido."] });
  }

  try {
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ errors: ["Usuário não encontrado!"] });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ errors: ["Erro ao buscar usuário."] });
  }
};

const SearchUser = async (req, res) => {
  const { q } = req.query;

  // Garante que a busca comece com a sequência fornecida
  const users = await User.find({
    $or: [
      { name: new RegExp(q, "i") },
      { interests: new RegExp(q, "i") } 
    ]
  }).exec();
  
  // pesquisar por letra
  // const users = await User.find({ name: new RegExp(q, "i") }).exec(); 

  res.status(200).json(users);
};


const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    console.log("Solicitação de redefinição de senha recebida para:", email);

    // Verifique se o e-mail está cadastrado
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ errors: ["Usuário não encontrado!"] });
    }

    // Gerar um token de redefinição de senha
    const token = crypto.randomBytes(20).toString("hex");

    // Definir o token e a expiração no usuário
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora

    await user.save();
    console.log("Token de redefinição de senha salvo no banco de dados.");

    // Configurar o transporte de e-mail (usando o Gmail neste exemplo)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Configurar o conteúdo do e-mail
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Redefinição de Senha",
      text: `
        Você está recebendo este e-mail porque solicitou a redefinição de senha para sua conta.
        Por favor, clique no link ou cole-o em seu navegador para concluir o processo:
        http://localhost:3000/reset-password/${token}
        Se você não solicitou isso, por favor ignore este e-mail.
      `,
    };

    // Enviar o e-mail
    await transporter.sendMail(mailOptions);
    console.log("E-mail de redefinição de senha enviado para:", user.email);

    res.status(200).json({ message: "E-mail de redefinição de senha enviado." });
  } catch (error) {
    console.error("Erro ao processar a solicitação de redefinição de senha:", error);
    res.status(500).json({ errors: ["Erro ao processar a solicitação de redefinição de senha."] });
  }
};


const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Encontrar o usuário pelo token de redefinição
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Certificar-se de que o token não expirou
    });

    if (!user) {
      return res.status(400).json({ errors: ["Token inválido ou expirado."] });
    }

    // Atualizar a senha do usuário
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;

    // Limpar o token e a expiração
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Senha redefinida com sucesso." });
  } catch (error) {
    res.status(500).json({ errors: ["Erro ao redefinir a senha."] });
  }
};



module.exports = {
  register,
  getCurrentUser,
  login,
  update,
  getUserById,
  SearchUser,
  requestPasswordReset,
  resetPassword,
};