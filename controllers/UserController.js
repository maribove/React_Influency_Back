const User = require("../models/User");

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
  const { name, password, bio, interests, instagram, emailcontato } = req.body;

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
  if (emailcontato) user.emailcontato = emailcontato;
  if (instagram) user.instagram = instagram;
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
  //  const users = await User.find({ name: new RegExp(q, "i") }).exec(); 

  res.status(200).json(users);
};



module.exports = {
  register,
  getCurrentUser,
  login,
  update,
  getUserById,
  SearchUser,
};