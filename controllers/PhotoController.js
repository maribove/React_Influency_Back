const Photo = require("../models/Photo");

const mongoose = require("mongoose");

// Insert a photo, with an user related to it
const insertPhoto = async (req, res) => {
  const { title } = req.body;
  const { atuacao } = req.body;
  const { local } = req.body;
  const { date } = req.body;
  const { desc } = req.body;
  const { situacao } = req.body;
  const { tags } = req.body;
  const image = req.file.filename;

  console.log(req.body);

  const reqUser = req.user;

  const user = await User.findById(reqUser._id);

  console.log(user.name);

  // Criar nova vaga 
  const newPhoto = await Photo.create({
    image,
    local,
    date,
    desc,
    situacao,
    title,
    atuacao,
    tags,
    userId: user._id,
    userName: user.name,
  });

  // If user was photo sucessfully, return data
  if (!newPhoto) {
    res.status(422).json({
      errors: ["Houve um erro, por favor tente novamente mais tarde."],
    });
    return;
  }

  res.status(201).json(newPhoto);
};

// Remove a photo from the DB
const deletePhoto = async (req, res) => {
  const { id } = req.params;

  const reqUser = req.user;

  try {
    const photo = await Photo.findById(new mongoose.Types.ObjectId(id));



    // Check if photo belongs to user
    if (!photo.userId.equals(reqUser._id)) {
      res
        .status(422)
        .json({ errors: ["Ocorreu um erro, tente novamente mais tarde"] });
      return;
    }

    await Photo.findByIdAndDelete(photo._id);

    res
      .status(200)
      .json({ id: photo._id, message: "Vaga excluída com sucesso." });


  } catch (error) {
    res.status(404).json({ errors: ["Vaga não encontrada!"] });
    return;
  }

}

// get todas as vagas, exibir na home
const getAllPhotos = async (req, res) => {
  const photos = await Photo.find({}).sort([["createdAt", -1]]).exec()

  return res.status(200).json(photos)
}

// get vagas do user
const getUserPhotos = async (req, res) => {
  const { id } = req.params
  const photos = await Photo.find({ userId: id })
    .sort([['createdAt', -1]])
    .exec()

    return res.status(200).json(photos)
}

// get by id
const getPhotoById = async (req, res) => {
  const {id} = req.params

  const photo = await Photo.findById( new mongoose.Types.ObjectId(id))

  // checar se existe
  if(!photo){
    res.status(404).json({errors:["Vaga não encontrada!"]})
    return
  }
  res.status(200).json(photo)
   
}

// update 
const updatePhoto = async (req, res) =>{
  const {id} = req.params
  const {title} = req.body
  const {atuacao} = req.body
  const {desc} = req.body 
  const {date} = req.body 
  const {local} = req.body
  const {situacao} = req.body

  const reqUser = req.user

  const photo = await Photo.findById(id)

  // checar se existe
  if(!photo){
    res.status(404).json({errors:["Vaga não encontrada!"]})
    return
  }

  // checar se pertence ao usuairo 
  if(!photo.userId.equals(reqUser._id)){
    res.status(422).json({errors:["Ocorreu um erro, tente novamente!"]
  })
    return
  }

  if(title){
    photo.title= title
  }
  if(atuacao){
    photo.atuacao= atuacao
  }
  if(local){
    photo.local= local
  }
  if(date){
    photo.date= date
  }
  if(desc){
    photo.desc= desc
  }
  if(situacao){
    photo.situacao= situacao
  }

  await photo.save()

  res.status(200).json({photo, message: "Vaga atualizada com sucesso!"})

}

const SearchPhoto = async (req, res) => {
  const { q } = req.query;

  // pesquisar por letra inicial
  const photos = await Photo.find({
    $or: [
      { title: new RegExp(q, "i") },
      { local: new RegExp(q, "i") },
      { userName: new RegExp(q, "i") },
      { tags: new RegExp(q, "i") }
    ]
  }).exec();
  
  // pesquisar por letra
  //  const photos = await Photo.find({ title: new RegExp(q, "i") }).exec(); 


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