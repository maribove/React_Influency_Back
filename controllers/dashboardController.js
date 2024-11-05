const Post = require("../models/Post");
const Photo = require("../models/Photo");
const Event = require("../models/Event");
const Support = require("../models/Suporte");

// Controlador para buscar dados de posts
const getPostsData = async (req, res) => {
    try {
        const userId = req.user._id;
        const posts = await Post.find({ userId }).populate("likes comments");
        const postData = {
            totalPosts: posts.length,
            totalLikes: posts.reduce((acc, post) => acc + post.likes.length, 0),
            totalComments: posts.reduce((acc, post) => acc + post.comments.length, 0),
        };
        console.log("Dados de posts retornados:", postData); // Log para depuração
        res.status(200).json(postData);
    } catch (error) {
        console.error("Erro ao buscar dados dos posts:", error);
        res.status(500).json({ message: "Erro ao buscar dados dos posts." });
    }
};


// Controlador para buscar dados de aplicações a vagas (photos)
const getApplicationsData = async (req, res) => {
    try {
        const userId = req.user._id;
        const photos = await Photo.find({ "appliedInfluencers.userId": userId });
        const applicationData = {
            totalApplications: photos.length,
            activeApplications: photos.filter(photo => photo.situacao === "Ativo").length,
        };
        res.status(200).json(applicationData);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar dados das vagas aplicadas." });
    }
};

// Controlador para buscar dados de eventos
const getEventsData = async (req, res) => {
    try {
        const userId = req.user._id;
        const events = await Event.find({ userId });
        const eventData = {
            totalEvents: events.length,
            upcomingEvents: events.filter(event => new Date(event.start) > new Date()).length,
            pastEvents: events.filter(event => new Date(event.end) < new Date()).length,
        };
        res.status(200).json(eventData);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar dados dos eventos." });
    }
};

// Controlador para buscar dados de tickets de suporte
const getSupportData = async (req, res) => {
    try {
        // Pega o email do usuário autenticado (influenciador logado)
        const userEmail = req.user.email;

        // Busca todos os tickets de suporte associados ao email do usuário logado
        const supportTickets = await Support.find({ email: userEmail });
        const supportData = {
            totalTickets: supportTickets.length,
            recentTickets: supportTickets.slice(-5),
        };

        res.status(200).json(supportData);
    } catch (error) {
        console.error("Erro ao buscar tickets de suporte:", error);
        res.status(500).json({ message: "Erro ao buscar tickets de suporte." });
    }
};

// Controlador para buscar projeção de ganhos
const getEarningsProjectionData = async (req, res) => {
    try {
      const userId = req.user._id;
  
      // Encontrar todas as campanhas onde o usuário está inscrito
      const campaigns = await Photo.find({ "appliedInfluencers.userId": userId });
  
      // Calcular o valor total potencial
      const totalProjectedEarnings = campaigns.reduce((sum, campaign) => sum + (campaign.valor || 0), 0);
  
      // Retornar o valor total e as campanhas
      res.status(200).json({
        totalProjectedEarnings,
        campaigns: campaigns.map(campaign => ({
          id: campaign._id,
          title: campaign.title,
          valor: campaign.valor,
          appliedAt: campaign.appliedInfluencers.find(inf => inf.userId.toString() === userId.toString())?.appliedAt,
        })),
      });
    } catch (error) {
      console.error("Erro ao buscar projeção de ganhos:", error);
      res.status(500).json({ message: "Erro ao buscar projeção de ganhos." });
    }
  };
  
module.exports = {
    getPostsData,
    getApplicationsData,
    getEventsData,
    getSupportData,
    getEarningsProjectionData, // Adicione esta linha

};
