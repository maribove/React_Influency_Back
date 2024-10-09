const nodemailer = require('nodemailer');
const SuporteSchema = require('../models/Suporte'); // Importa o modelo de suporte
require('dotenv').config(); // Carrega as variáveis de ambiente

// Função para receber o formulário de suporte
const Suporte = async (req, res) => {
    const { name, email, message } = req.body; // Corrigido

    if (!name || !email || !message) { // Corrigido
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    try {
        // Configurando o nodemailer para enviar um email
        let transporter = nodemailer.createTransport({
            service: 'gmail', // Use o serviço de email que preferir
            auth: {
                user: process.env.EMAIL_USER, // Seu email
                pass: process.env.EMAIL_PASS  // Sua senha ou chave de acesso
            }
        });

        let info = await transporter.sendMail({
            from: process.env.EMAIL_USER, // Use seu email
            to: process.env.EMAIL_USER, // Para onde o suporte será enviado
            subject: "Suporte - Dúvida de " + name,
            text: `Nome: ${name}\nEmail: ${email}\nPergunta: ${message}` // Corrigido
        });

        // Salvar no banco de dados
        const novoSuporte = new SuporteSchema({ name, email, message });
        await novoSuporte.save(); // Salva a mensagem no MongoDB

        res.status(200).json({ message: 'Suporte enviado com sucesso!' });

    } catch (error) {
        console.log("Erro ao enviar e-mail:", error.message); // Melhor manejo de erro
        res.status(500).json({ error: 'Erro ao enviar suporte.' });
    }
};

module.exports = { Suporte };
