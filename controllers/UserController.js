const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

const jwtSecret = process.env.JWT_SECRET;

// Generate user token
const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: "7d",
  });
};

// Register user and sign in
const register = async (req, res) => {
  const { name, email, password } = req.body;

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
    password: passwordHash,
  });

  // If user was created sucessfully, return the token
  if (!newUser) {
    res.status(422).json({
      errors: ["Houve um erro, por favor tente novamente mais tarde."],
    });
    return;
  }

  res.status(201).json({
    _id: newUser._id,
    token: generateToken(newUser._id),
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

  // Return user with token
  res.status(200).json({
    _id: user._id,
    profileImage: user.profileImage,
    token: generateToken(user._id),
  });
};

// Update user
const update = async (req, res) => {
  const { name, password, bio } = req.body;

  let profileImage = null;

  if (req.file) {
    profileImage = req.file.filename;
  }

  const reqUser = req.user;

  const user = await User.findById(new mongoose.Types.ObjectId(reqUser._id)).select(
    "-password"
  );

  if (name) {
    if (name.length < 3) {
      return res.status(400).json({ errors: ["O nome deve ter mais de 3 caracteres."] });
    } 
    user.name = name;
  }

  if (password) {
    if (password.length < 6) {
      return res.status(400).json({ errors: ["A senha deve ter mais de 6 caracteres."] });
    } if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ errors: ["A senha deve conter pelo menos uma letra maiúscula."] });
    } if (!/\d/.test(password)) {
      return res.status(400).json({ errors: ["A senha deve conter pelo menos um número."] });
    } if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return res.status(400).json({ errors: ["A senha deve conter pelo menos um caractere especial."] });
    }
    
    
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    user.password = passwordHash;
  }

  if (profileImage) {
    user.profileImage = profileImage;
  }

  if (bio) {
    if (bio.length < 5) {
      return res.status(400).json({ errors: ["A biografia deve ter mais de 5 caracteres."] });
    } 
    user.bio = bio;
  }

  await user.save();

  res.status(200).json(user);
};

// Get user by id
const getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById( new mongoose.Types.ObjectId(id)).select(
    "-password"
  );

  // Check if user exists
  if (!user) {
    res.status(404).json({ errors: ["Usuário não encontrado!"] });
    return;
  }

  res.status(200).json(user);
};

module.exports = {
  register,
  getCurrentUser,
  login,
  update,
  getUserById,
};