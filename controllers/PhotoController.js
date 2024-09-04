const Photo = require("../models/Photo");
const mongoose = require("mongoose");
const User = require("../models/User"); 

// Inserir uma foto
const insertPhoto = async (req, res) => {
  const { title, local, date, desc, situacao, tags } = req.body;
  
  
  if (!req.files || !req.files.image || req.files.image.length === 0) {
    return res.status(400).json({ errors: ["A imagem é obrigatória."] });
  }

  const image = req.files.image[0].filename;
  let contrato = null;

  if (req.files.contrato && req.files.contrato.length > 0) {
    contrato = req.files.contrato[0].filename;
  }

  const reqUser = req.user;

  try {
    const user = await User.findById(reqUser._id);

    if (!user) {
      return res.status(404).json({ errors: ["Usuário não encontrado."] });
    }

    // Criar nova vafa
    const newPhoto = await Photo.create({
      image,
      local,
      date,
      desc,
      situacao,
      title,
      tags,
      contrato,
      userId: user._id,
      userName: user.name,
    });

    res.status(201).json(newPhoto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ["Houve um erro ao criar a foto, por favor tente novamente."] });
  }
};

// Remover uma vaga do banco de dados
const deletePhoto = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user;

  try {
    const photo = await Photo.findById(new mongoose.Types.ObjectId(id));

    if (!photo) {
      return res.status(404).json({ errors: ["Vaga não encontrada!"] });
    }

    // Verificar se a vaga pertence ao usuário
    if (!photo.userId.equals(reqUser._id)) {
      return res.status(422).json({
        errors: ["Ocorreu um erro, tente novamente mais tarde."],
      });
    }

    await Photo.findByIdAndDelete(photo._id);

    res.status(200).json({ id: photo._id, message: "Vaga excluída com sucesso." });
  } catch (error) {
    return res.status(404).json({ errors: ["Vaga não encontrada!"] });
  }
};

// Obter todas as vagas
const getAllPhotos = async (req, res) => {
  const photos = await Photo.find({}).sort([["createdAt", -1]]).exec();
  res.status(200).json(photos);
};

// Obter vagas do usuário
const getUserPhotos = async (req, res) => {
  const { id } = req.params;
  const photos = await Photo.find({ userId: id }).sort([["createdAt", -1]]).exec();
  res.status(200).json(photos);
};

// Obter vaga por ID
const getPhotoById = async (req, res) => {
  const { id } = req.params;

  const photo = await Photo.findById(new mongoose.Types.ObjectId(id));

  if (!photo) {
    return res.status(404).json({ errors: ["Vaga não encontrada!"] });
  }

  res.status(200).json(photo);
};

// Atualizar uma vaga

const updatePhoto = async (req, res) => {
  const { id } = req.params;
  const { title, desc, date, local, situacao } = req.body;
  let contrato = null;

  if (req.files && req.files.contrato && req.files.contrato.length > 0) {
    contrato = req.files.contrato[0].filename;
  }

  const reqUser = req.user;

  try {
    const photo = await Photo.findById(id);

    if (!photo) {
      return res.status(404).json({ errors: ["Foto não encontrada!"] });
    }

    if (!photo.userId.equals(reqUser._id)) {
      return res.status(403).json({
        errors: ["Você não tem permissão para atualizar esta foto."],
      });
    }

    if (title) photo.title = title;
    if (local) photo.local = local;
    if (date) photo.date = date;
    if (desc) photo.desc = desc;
    if (situacao) photo.situacao = situacao;
    if (contrato) photo.contrato = contrato;

    await photo.save();

    res.status(200).json({ photo, message: "Foto atualizada com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ["Houve um erro ao atualizar a foto, por favor tente novamente."] });
  }
};

// Pesquisar vagas
const SearchPhoto = async (req, res) => {
  const { q } = req.query;

  const photos = await Photo.find({
    $or: [
      { title: new RegExp(q, "i") },
      { local: new RegExp(q, "i") },
      { userName: new RegExp(q, "i") },
      { tags: new RegExp(q, "i") },
    ],
  }).exec();

  res.status(200).json(photos);
};

module.exports = {
  insertPhoto,
  deletePhoto,
  getAllPhotos,
  getUserPhotos,
  getPhotoById,
  updatePhoto,
  SearchPhoto,
};
