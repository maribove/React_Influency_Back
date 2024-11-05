const Post = require("../models/Post"); // Importando o modelo Post

const mongoose = require("mongoose");

//Post no feed
// Inserir, com um usuário relacionado a ele
const insertPost = async (req, res) => {
  const { publicacao } = req.body;
  const image = req.file ? req.file.filename : null; 


  const reqUser = req.user;

  if (!mongoose.Types.ObjectId.isValid(reqUser._id)) {
    return res.status(400).json({ errors: ["ID de usuário inválido."] });
  }

  // Buscar o usuário a partir do ID
  const user = await User.findById(reqUser._id);

  //valores da publicação
  try {
    const newPost = await Post.create({
      publicacao,
      image,
      userId: user._id,
      userName: user.name,
      profileImage: user.profileImage, 
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

    if (!post.userId.equals(reqUser._id) && reqUser.role !== "admin") {
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
  const posts = await Post.find({}).sort([["createdAt", -1]]).exec()

  return res.status(200).json(posts)
}

const getPostsByInterests = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ errors: ["Usuário não autenticado."] });
    }

    // Verifique se o usuário é Admin
    if (user.role === "admin") {
      // Se for Admin, retorne todos os posts
      const posts = await Post.find({}).sort([["createdAt", -1]]).exec();
      return res.status(200).json(posts);
    }

    //interesses do usuário logado
    const userInterests = user.interests;

    //usuários que têm pelo menos um interesse em comum
    const usersWithCommonInterests = await User.find({
      interests: { $in: userInterests },
    }).select("_id");

    const userIds = usersWithCommonInterests.map(user => user._id);

    //pega os posts dos usuários
    const posts = await Post.find({ userId: { $in: userIds } }).sort([["createdAt", -1]]).exec();

    res.status(200).json(posts);
  } catch (error) {
    console.error("Erro ao buscar publicações:", error);
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

  console.log("ID do Post:", id); // Log para verificar se o ID está correto
  console.log("Dados da Publicação:", req.body); // Log para verificar se os dados estão corretos

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

// like no post
const LikePost = async (req, res) => {
  const { id } = req.params

  const reqUser = req.user

  const post = await Post.findById(id)
  if (!post) {
     res.status(404).json({ errors: ["Publicação não encontrada!"] });
     return;
  }

  // checar se já curtiu
  if (post.likes.includes(reqUser._id)) {
    res.status(422).json({ errors: ["Post já foi curtido!"] })
    return;
  }

  // colocar id do usuário no array de likes
  post.likes.push(reqUser._id)
  post.save()

  res.status(200).json({ postId: id, userid: reqUser._id, message: "Post curtido!" })
}

// comentar em post
const commentPost = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const reqUser = req.user;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ errors: ["Publicação não encontrada!"] });
    }

    if (!post.comments) {
      post.comments = [];
    }

    const userComment = {
      comment,
      userName: reqUser.name,
      userImage: reqUser.profileImage,
      userId: reqUser._id,
    };

    post.comments.push(userComment);
    await post.save();

    res.status(200).json({
      comment: userComment,
      message: "Comentário adicionado!",
    });
  } catch (error) {
    res.status(500).json({ errors: ["Erro ao adicionar comentário."] });
  }
};





module.exports = {
  insertPost,
  deletePost,
  getAllPosts,
  getPostsByInterests,
  getUserPosts,
  getPostById,
  updatePost,
  LikePost,
  commentPost, 
};