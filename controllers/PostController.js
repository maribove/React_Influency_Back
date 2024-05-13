const Post = require("../models/Post"); // Importando o modelo Post

const mongoose = require("mongoose");

// Inserir, com um usuário relacionado a ele
const insertPost = async (req, res) => {
  const { publicacao } = req.body;
  const  image  = req.file.filename;

  console.log(req.body);


  const reqUser = req.user;

  if (!mongoose.Types.ObjectId.isValid(reqUser._id)) {
    return res.status(400).json({ errors: ["ID de usuário inválido."] });
  }

  const user = await User.findById(reqUser._id);

  console.log(user.name);

  try {
    const newPost = await Post.create({
      publicacao,
      image,
      userId: user._id,
      userName: user.name,
    });

    if (!newPost) {
      return res.status(422).json({
        errors: ["Houve um erro, por favor tente novamente mais tarde."],
      });
    }

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ errors: ["Erro ao criar publicação."] });
  }

  console.log(req.user)
};


// Remover do banco de dados
const deletePost = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ errors: ["ID de postagem inválido."] });
  }

  const reqUser = req.user;

  try {
    const post = await Post.findById(id);

    if (!post.userId.equals(reqUser._id)) {
      return res.status(422).json({ errors: ["Ocorreu um erro, tente novamente mais tarde"] });
    }

    await Post.findByIdAndDelete(post._id);

    res.status(200).json({ id: post._id, message: "Publicação excluída com sucesso." });
  } catch (error) {
    res.status(404).json({ errors: ["Publicação não encontrada!"] });
  }
};


// Obter todas as publicações
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).sort([["createdAt", -1]]).exec();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ errors: ["Erro ao buscar publicações."] });
  }
};


// Obter publicações do usuário
const getUserPosts = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ errors: ["ID de usuário inválido."] });
  }

  try {
    const posts = await Post.find({ userId: id }).sort([['createdAt', -1]]).exec();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ errors: ["Erro ao buscar publicações do usuário."] });
  }
};

// Obter por ID
const getPostById = async (req, res) => {
  const { id } = req.params;

  // Verificar se o ID é um ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ errors: ["ID inválido."] });
  }

  try {
    const post = await Post.findById(id); // Não é necessário usar new ObjectId aqui

    if (!post) {
      return res.status(404).json({ errors: ["Publicação não encontrada!"] });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ errors: ["Erro ao buscar publicação."] });
  }
};


// Atualizar
const updatePost = async (req, res) => {
  const { id } = req.params;
  const { publicacao } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ errors: ["ID de postagem inválido."] });
  }

  const reqUser = req.user;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ errors: ["Publicação não encontrada!"] });
    }

    if (!post.userId.equals(reqUser._id)) {
      return res.status(422).json({ errors: ["Ocorreu um erro, tente novamente!"] });
    }

    if (publicacao) {
      post.publicacao = publicacao;
    }

    await post.save();

    res.status(200).json({ post, message: "Publicação atualizada com sucesso!" });
  } catch (error) {
    res.status(500).json({ errors: ["Erro ao atualizar publicação."] });
  }
};


module.exports = {
  insertPost,
  deletePost,
  getAllPosts,
  getUserPosts,
  getPostById,
  updatePost,
};