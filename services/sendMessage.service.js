const { v4: uuidv4 } = require("uuid");
const { models } = require("../libs/sequelize");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
class sendEmailToNewUserService {
  async sendEmail(userId, email) {
    const BASE_URL = process.env.NEW_USER_BASE_URL;
    const CONTACT_EMAIL = process.env.CONTACT_EMAIL;
    const LANDING_PAGE_URL = process.env.LANDING_PAGE_URL;

    // Genera un token único y establece una fecha de expiración
    const token = uuidv4();
    const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    try {
      await this.saveTokenForUser(userId, token, expirationDate);
      // Crea la URL con el token
      const verificationUrl = `${BASE_URL}/verify?token=${token}`;
      // Crear el transportador con la configuración necesaria
      const transporter = nodemailer.createTransport({
        port: 465,
        host: process.env.NODEMAILER_HOST,
        secure: true,
        secureConnection: false,
        tls: {
          ciphers: "SSLv3",
        },
        requireTLS: true,
        debug: true,
        connectionTimeout: 10000,
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASSWORD,
        },
      });
      await transporter.verify();

      const templatePath = path.join(
        __dirname,
        "..",
        "/templates/",
        "mail_template.html"
      );

      let emailTemplate = fs
        .readFileSync(templatePath, "utf8")
        .replace("{{URL_DE_ACTIVACION}}", verificationUrl)
        .replace("{{Support_Email}}", CONTACT_EMAIL)
        .replace("{{URL_SITIO_LANDING}}", LANDING_PAGE_URL);
      console.log("Conexión exitosa con el servidor SMTP");

      // Enviar el correo de forma asincrónica
      const info = await transporter.sendMail({
        from: process.env.NODEMAILER_FROM, // Dirección del remitente
        to: email, // Dirección de destino
        subject: "PMMS Verify Account", // Asunto del correo
        text: "message_content.toString()", // Mensaje en texto plano
        html: emailTemplate,
      });

      // Determinar el resultado basado en la respuesta del envío
      let resp = {};
      if (info.messageId) {
        resp.messageId = info.messageId;
        resp.messageStatus = "sended";
        console.log("Message sent: %s", info.messageId);
      } else {
        resp.messageStatus = "error";
        console.error("Error en el envío del mensaje");
      }
      return resp;
    } catch (error) {
      console.log(error);
      return { error: error };
    }
  }

  async saveTokenForUser(userId, token, expiresAt) {
    const rta = await models.VerificationToken.create({
      token: token,
      expiresAt: expiresAt,
      userId: userId,
    });
    return rta;
  }
}

module.exports = { sendEmailToNewUserService };
