/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { AIContext } = require("./ai-context");


const nodemailer = require("nodemailer");

// Configura tu cuenta de Gmail y usa nodemailer para configurarla como SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "calzadillaj955@gmail.com", // Tu dirección de correo de Gmail
    pass: "wjzf aydm casb lfng", // Tu contraseña de Gmail o una contraseña de aplicación si tienes 2FA habilitado
  },
});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

//Hacemos una funcion que se comunica con una api para hacer el chatbot

const cors = {
  cors: [
    "https://juanccalzadilla.github.io",
    "http://localhost:5500",
    "http://localhost:4200",
    "http://127.0.0.1:5500",
  ],
};


// Firebase Function para enviar un correo electrónico
exports.sendEmail = onRequest(cors,(req, res) => {
  // Obtener datos del cuerpo de la solicitud (por ejemplo, desde una petición POST)
  const { subject, texto_usuario, phone, company, name, email } = req.body;

  // Configuración del correo
  const mailOptions = {
    from: "calzadillaj955@gmail.com", // Dirección del remitente
    to: 'juancalzadilla8@gmail.com', // Dirección del destinatario
    subject: 'Nueva solicitud de contacto desde portafolio.', // Asunto
    html: `
      <h1>¡Hola Juan!</h1>
      <p>Has recibido un mensaje de <strong>${name}</strong> de la empresa <strong>${company}</strong></p>
      <p><strong>Teléfono:</strong> ${phone}</p>
      <p><strong>Correo:</strong> ${email}</p>
      <p><strong>Mensaje:</strong> ${texto_usuario}</p>
    `,
  };

  // Enviar el correo
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(500).send({
        status: false,
        message: "Error al enviar el correo",
        error: error,
      });
    } else {
      res.status(200).send({
        status: true,
        message: "Correo enviado",
        messageId: info.messageId,
      });
    }
  });
});

exports.chatbot = onRequest(
  cors,
  async (request, res) => {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBJRcVJr3dBeqokT3NJkasW1GUrW4_JvtE";

    const AIPayload = {
      generationConfig: {
        temperature: 1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      },
    };

    const data = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: request.body.text,
            },
          ],
        },
      ],
      systemInstruction: {
        role: "user",
        parts: [
          {
            text: AIContext,
          },
        ],
      },
      ...AIPayload,
    };

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((response) => {
      response.json().then((data) => {
        res.json({
          text: data.candidates[0].content.parts[0].text,
        });
      });
    });
  }
);
