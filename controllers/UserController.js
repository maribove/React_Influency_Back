const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
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
  const { name, email, password, role, interests, usuario } = req.body;

  // check if user exists
  const user = await User.findOne({ email });

  if (user) {
    res.status(422).json({ errors: ["E-mail já está sendo utilizado. Por favor, utilize outro e-mail!"] });
    return;
  }

  const user_usuario = await User.findOne({ usuario });

  if (user_usuario) {
    res.status(422).json({ errors: ["Nome de usuário já está sendo utilizado. Por favor, utilize outro!"] });
    return;
  }


  // Generate password hash
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await User.create({
    name,
    usuario,
    email,
    role,
    interests,
    password: passwordHash,
  });

  // If user was created successfully, return the token
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
    usuario: newUser.usuario,
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

  // Return user with token
  res.status(200).json({
    _id: user._id,
    role: user.role,
    profileImage: user.profileImage,
    token: token,
  });
};

// Update user
const update = async (req, res) => {
  const { name, password, bio, interests, instagram, emailcontato, telefone } = req.body;

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
  if (telefone) user.telefone = telefone;
  if (emailcontato) user.emailcontato = emailcontato;
  if (instagram) user.instagram = instagram;
 if (interests) {
    user.interests = Array.isArray(interests) ? interests : interests.split(',').map(item => item.trim().toLowerCase());
  }
  if (profileImage) user.profileImage = profileImage;
  if (portfolio) user.portfolio = portfolio;

  await user.save();

  res.status(200).json(user);
};

// Get user by ID
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

// Search usuario
const SearchUser = async (req, res) => {
  const { q } = req.query;

  
  const users = await User.find({
    $or: [
      { name: new RegExp(q, "i") },
      { interests: new RegExp(q, "i") },
      { usuario: new RegExp(q, "i") }
    ]
  }).exec();

  res.status(200).json(users);
};

// Password reset request
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
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
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: justify;">
          <h2>Redefinição de Senha</h2>
          <p>Olá, ${user.name}!</p>
          <p>Você solicitou a redefinição de sua senha. Por favor, clique no botão abaixo para redefini-la:</p>
          <a href="http://localhost:3000/reset-password/${token}" 
             style="background-color: #EF97B4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Redefinir Senha
          </a>
          <p>Ou cole o seguinte link em seu navegador:</p>
          <p><a href="http://localhost:3000/reset-password/${token}">http://localhost:3000/reset-password/${token}</a></p>
         
          <p>Se você não solicitou esta redefinição, ignore este email.</p>
          <p>Atenciosamente,<br> Equipe Influency</p>
        </div>
      `,
    };
    

    // Enviar o e-mail
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "E-mail de redefinição de senha enviado." });
  } catch (error) {
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


    // Verificar se a nova senha é igual à senha atual
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({ errors: ["A nova senha não pode ser igual à senha atual."] });
    }

    // Validar a senha
    const passwordErrors = [];
    if (password.length < 6) {
      passwordErrors.push("A senha deve ter no mínimo 6 caracteres");
    }
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push("A senha deve conter pelo menos uma letra maiúscula");
    }
    if (!/\d/.test(password)) {
      passwordErrors.push("A senha deve conter pelo menos um número");
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      passwordErrors.push("A senha deve conter pelo menos um caractere especial");
    }

    if (passwordErrors.length > 0) {
      return res.status(400).json({ errors: passwordErrors });
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
