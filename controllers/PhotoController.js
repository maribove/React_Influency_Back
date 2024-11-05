const Photo = require("../models/Photo");
const mongoose = require("mongoose");
const User = require("../models/User");
const nodemailer = require('nodemailer');
require('dotenv').config(); // Carrega as variáveis de ambiente

// Inserir uma vaga
const insertPhoto = async (req, res) => {
  const { title, local, date, desc, valor, situacao, tags } = req.body;



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

    // Criar nova vaga
    const newPhoto = await Photo.create({
      image,
      local,
      date,
      desc,
      situacao,
      valor,
      title,
      tags,
      contrato,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
    });

    res.status(201).json(newPhoto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ["Houve um erro ao criar a vaga, por favor tente novamente."] });
  }
};

// Remover uma vaga do banco de dados
const deletePhoto = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user;

  try {
    const photo = await Photo.findById((id));

    if (!photo) {
      return res.status(404).json({ errors: ["Vaga não encontrada!"] });
    }

    // Verificar se a vaga pertence ao usuário
    if (photo.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ errors: ["Ação não permitida!"] });
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
      return res.status(404).json({ errors: ["Vaga não encontrada!"] });
    }

    if (!photo.userId.equals(reqUser._id)) {
      return res.status(403).json({
        errors: ["Você não tem permissão para atualizar esta vaga."],
      });
    }

    if (title) photo.title = title;
    if (local) photo.local = local;
    if (date) photo.date = date;
    if (desc) photo.desc = desc;
    if (situacao) photo.situacao = situacao;
    if (contrato) photo.contrato = contrato;

    await photo.save();

    res.status(200).json({ photo, message: "Vaga atualizada com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ["Houve um erro ao atualizar a vaga, por favor tente novamente."] });
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

// Função para aplicar a uma vaga
const applyToJob = async (req, res) => {
  const { id } = req.params; // ID da vaga (photo)
  const reqUser = req.user;  // Usuário logado (influenciador)

  if (reqUser.role !== "Influenciador") {
    return res.status(403).json({ errors: ["Somente influenciadores podem aplicar para esta vaga."] });
  }

  try {
    const photo = await Photo.findById(id);

    // Verificar se a vaga existe
    if (!photo) {
      return res.status(404).json({ errors: ["Vaga não encontrada."] });
    }

    // Verificar se o usuário já aplicou para a vaga
    const alreadyApplied = photo.appliedInfluencers.find(influencer => influencer.userId.equals(reqUser._id));
    if (alreadyApplied) {
      return res.status(422).json({ errors: ["Você já aplicou para esta vaga."] });
    }

    // Adicionar o influenciador à lista de inscritos
    photo.appliedInfluencers.push({ userId: reqUser._id });
    await photo.save();

    res.status(200).json({ message: "Inscrição realizada com sucesso!" });
  } catch (error) {
    console.error("Erro ao aplicar para a vaga:", error);
    res.status(500).json({ errors: ["Erro ao aplicar para a vaga."] });
  }
};

// Função para cancelar a inscrição
const cancelApplication = async (req, res) => {
  const { id } = req.params; // ID da vaga
  const reqUser = req.user;  // Usuário logado (influenciador)

  if (reqUser.role !== "Influenciador") {
    return res.status(403).json({ errors: ["Somente influenciadores podem cancelar a inscrição para esta vaga."] });
  }

  try {
    const photo = await Photo.findById(id);

    // Verificar se a vaga existe
    if (!photo) {
      return res.status(404).json({ errors: ["Vaga não encontrada."] });
    }

    // Verificar se o influenciador está inscrito
    const appliedIndex = photo.appliedInfluencers.findIndex(influencer => influencer.userId.equals(reqUser._id));
    if (appliedIndex === -1) {
      return res.status(422).json({ errors: ["Você não está inscrito para esta vaga."] });
    }

    // Remover o influenciador da lista de inscritos
    photo.appliedInfluencers.splice(appliedIndex, 1);
    await photo.save();

    res.status(200).json({ message: "Inscrição cancelada com sucesso!" });
  } catch (error) {
    console.error("Erro ao cancelar a inscrição:", error);
    res.status(500).json({ errors: ["Erro ao cancelar a inscrição."] });
  }
};

// Verificar se o influenciador já aplicou a uma vaga
const getApplicants = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user; // Usuário logado

  try {
    const photo = await Photo.findById(id).populate("appliedInfluencers.userId", "name profileImage");

    if (!photo) {
      return res.status(404).json({ errors: ["Vaga não encontrada."] });
    }

    // Verifica se o influenciador logado já aplicou à vaga
    const alreadyApplied = photo.appliedInfluencers.some((applicant) =>
      applicant.userId && applicant.userId.equals(reqUser._id) // Adicionando verificação se userId não é null
    );

    // Retorna o estado de aplicação e os influenciadores aplicados
    res.status(200).json({ applied: alreadyApplied, applicants: photo.appliedInfluencers });
  } catch (error) {
    console.error("Erro ao buscar aplicantes:", error);
    res.status(500).json({ errors: ["Erro ao buscar aplicantes."] });
  }
};

const sendEmail = async (influencer, photo) => {
  // Configurar o transporter do nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Template do email
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #ddd;">
    <h2 style="color: #EF97B4; text-align: center;">Parabéns você foi selecionado! ✨😁🎉</h2>
    <p>Olá <strong>${influencer.name}</strong>,</p>
    <p>Você foi selecionado para a vaga: <strong>${photo.title}</strong> da <strong>${photo.userName}</strong>.</p>
    <p><strong>Local:</strong> ${photo.local}</p>
    <p><strong>Descrição:</strong></p>
    <p style="background-color: #fff; padding: 10px; border-left: 4px solid #EF97B4; margin: 10px 0;">${photo.desc}</p>
    <p>Entre em contato com a empresa para mais detalhes.</p>
    <p style="font-weight: bold;">Agradecemos seu interesse e desejamos boa sorte! 🩵🍀🩷</p>
    <p style="font-size: 0.9em; color: #777; text-align: center;">Este é um email automático, por favor não responda.</p>
</div>

  `;

  const mailOptions = {
    from: {
      name: 'Influency',
      address: process.env.EMAIL_USER
    },
    to: influencer.email,
    subject: "Parabéns, você foi selecionado!",
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
};

const selectInfluencer = async (req, res) => {
  const { id, influencerId } = req.params;
  const reqUser = req.user;

  try {
    if (reqUser.role !== "Empresa") {
      return res.status(403).json({ errors: ["Somente empresas podem selecionar influenciadores."] });
    }

    const photo = await Photo.findById(id);

    if (!photo) {
      return res.status(404).json({ errors: ["Vaga não encontrada."] });
    }

    if (!photo.userId.equals(reqUser._id)) {
      return res.status(403).json({ errors: ["Você não tem permissão para selecionar influenciadores nesta vaga."] });
    }

    const influencer = await User.findById(influencerId);

    if (!influencer) {
      return res.status(404).json({ errors: ["Influenciador não encontrado."] });
    }

    const isApplied = photo.appliedInfluencers.some(
      applicant => applicant.userId.toString() === influencerId
    );

    if (!isApplied) {
      return res.status(404).json({ errors: ["Influenciador não encontrado na lista de inscritos."] });
    }

    photo.selectedInfluencer = {
      userId: influencerId,
      userName: influencer.name,
      userEmail: influencer.email,
    };
    photo.situacao = "Encerrada";
    await photo.save();

    try {
      await sendEmail(influencer, photo);
      res.status(200).json({ message: "Influenciador selecionado e notificado por e-mail!" });
    } catch (emailError) {
      // Ainda salvamos a seleção, mas notificamos o erro no email
      console.error("Erro ao enviar email:", emailError);
      res.status(200).json({ 
        message: "Influenciador selecionado, mas houve um erro ao enviar o email de notificação.",
        warning: "Email não enviado"
      });
    }

  } catch (error) {
    console.error("Erro ao selecionar influenciador:", error);
    res.status(500).json({ errors: ["Erro ao selecionar influenciador."] });
  }
};

// Função para fazer upload do contrato após a vaga ser postada
const uploadContract = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user;

  try {
    // Verifica se um arquivo foi enviado
    if (!req.files || !req.files.contrato || req.files.contrato.length === 0) {
      return res.status(400).json({ errors: ["Nenhum contrato foi enviado."] });
    }

    const photo = await Photo.findById(id);

    // Verifica se a vaga existe
    if (!photo) {
      return res.status(404).json({ errors: ["Vaga não encontrada!"] });
    }

    // Verifica se o usuário tem permissão para adicionar o contrato
    if (!photo.userId.equals(reqUser._id) && reqUser.role !== "admin") {
      return res.status(403).json({
        errors: ["Você não tem permissão para adicionar contrato a esta vaga."],
      });
    }

    // Atualiza o nome do arquivo do contrato
    const contrato = req.files.contrato[0].filename;
    photo.contrato = contrato;

    await photo.save();

    res.status(200).json({ 
      message: "Contrato adicionado com sucesso!", 
      contrato: photo.contrato 
    });

  } catch (error) {
    console.error("Erro ao fazer upload do contrato:", error);
    res.status(500).json({ 
      errors: ["Houve um erro ao fazer upload do contrato, por favor tente novamente."] 
    });
  }
};


module.exports = {
  insertPhoto,
  deletePhoto,
  getAllPhotos,
  getUserPhotos,
  getPhotoById,
  updatePhoto,
  SearchPhoto,
  applyToJob,
  cancelApplication,
  getApplicants,
  sendEmail,
  selectInfluencer,
};
