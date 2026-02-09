const transporter = require("../utils/emailTransporter");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

class SendEmailService {
  async sendEmail(data) {
    const { recipient, message } = data;

    try {
      const templatePath = path.join(
        __dirname,
        "..",
        "/templates/",
        "mail_template.html"
      );
      let emailTemplate = fs.readFileSync(templatePath, "utf8");

      emailTemplate = emailTemplate.replace(
        "{{MENSAJE_PROGRAMADO}}",
        message
      );
      console.log("Conexión exitosa con el servidor SMTP");
      // Enviar el correo de forma asincrónica
      const info = await transporter.sendMail({
        from: process.env.NODEMAILER_FROM, // Dirección del remitente
        to: recipient, // Dirección de destino
        subject: "PMMS - Pocho`s Messages Managment System", // Asunto del correo
        text: message.toString(), // Mensaje en texto plano
        html: emailTemplate,
      });
      return info;
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = { SendEmailService };
