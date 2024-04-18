// // server.js

// const express = require('express');
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// const nodemailer = require('nodemailer');
// const User = require('./models/User');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(bodyParser.json());

// // MongoDB setup
// `mongodb+srv://${dbUser}:${dbPassword}@cluster0.rdufh7t.mongodb.net/`
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', () => console.log('Connected to MongoDB'));

// // Nodemailer setup
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'your-email@gmail.com',
//         pass: 'your-password',
//     },
// });

// // Routes
// app.post('/api/forgot-password', async (req, res) => {
//     const { email } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).send('E-mail não encontrado.');
//         }

//         // Gerar e salvar token de redefinição de senha
//         const resetToken = Math.random().toString(36).substring(2, 15);
//         user.resetToken = resetToken;
//         await user.save();

//         // Enviar e-mail com o token
//         const mailOptions = {
//             from: 'your-email@gmail.com',
//             to: email,
//             subject: 'Redefinir Senha',
//             text: `Use este token para redefinir sua senha: ${resetToken}`,
//         };
//         await transporter.sendMail(mailOptions);

//         res.status(200).send('Um e-mail foi enviado para redefinir sua senha.');
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Ocorreu um erro ao processar sua solicitação.');
//     }
// });

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
