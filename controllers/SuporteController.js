const nodemailer = require('nodemailer');
const SuporteSchema = require('../models/Suporte'); // Importa o modelo de suporte
require('dotenv').config(); // Carrega as variáveis de ambiente

// Função para receber o formulário de suporte
const Suporte = async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    try {
        // Configurando o nodemailer para enviar um email
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Seu email
                pass: process.env.EMAIL_PASS // Sua senha ou chave de acesso
            }
        });

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #EF97B4;">Nova Mensagem de Suporte</h2>
                <p><strong>Nome:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Mensagem:</strong></p>
                <p style="border: 1px solid #ddd; padding: 10px; border-radius: 5px;">${message}</p>
                <p style="font-size: 0.9em; color: #777;">Por favor, responda a este e-mail para fornecer suporte ao usuário.</p>
            </div>
        `;

        // Configuração do email
        let info = await transporter.sendMail({
            from: `<${email}>`, // Usa o nome e email do usuário como remetente
            to: process.env.EMAIL_USER, // Para onde o suporte será enviado
            subject: "Suporte - Dúvida de " + name,
            html: htmlContent, // Envia o conteúdo HTML
            replyTo: `${name} <${email}>`, // Adiciona o e-mail do usuário para resposta
        });

        // Salvar no banco de dados
        const novoSuporte = new SuporteSchema({ name, email, message });
        await novoSuporte.save(); // Salva a mensagem no MongoDB 

        res.status(200).json({ message: 'E-mail enviado com sucesso!' });

    } catch (error) {
        console.log("Erro ao enviar e-mail:", error.message);
        res.status(500).json({ error: 'Erro ao enviar suporte.' });
    }
};

module.exports = { Suporte };
