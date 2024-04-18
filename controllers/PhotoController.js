const Photo = require("../models/Photo");

const mongoose = require("mongoose");

// Insert a photo, with an user related to it
const insertPhoto = async (req, res) => {
  const { title } = req.body;
  const { desc } = req.body;
  const image = req.file.filename;

  console.log(req.body);

  const reqUser = req.user;

  const user = await User.findById(reqUser._id);

  console.log(user.name);

  // Create photo
  const newPhoto = await Photo.create({
    image,
    desc,
    title,
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
  const {desc} = req.body 

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
  if(desc){
    photo.desc= desc
  }

  await photo.save()

  res.status(200).json({photo, message: "Vaga atualizada com sucesso!"})

}




module.exports = {
  insertPhoto,
  deletePhoto,
  getAllPhotos,
  getUserPhotos,
  getPhotoById,
  updatePhoto,

};