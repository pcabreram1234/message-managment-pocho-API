const express = require("express");
const { verifyToken } = require("../middlewares/auth.handler");
const { SendEmailService } = require("../services/send-email.service");
const {
  handleCoolDown,
  handleLimitRecipients,
  dailySendLimit,
  handleHighRiskWords,
  handleRepetitiveContent
} = require("../middlewares/sendInstantMessage");
const { initSequelize } = require("../libs/sequelize");
const router = express.Router();
router.post(
  "/:id",
  verifyToken, handleLimitRecipients, handleCoolDown, dailySendLimit, handleHighRiskWords, handleRepetitiveContent,
  async (req, res, next) => {
    try {
      const data = req.body.data;
      const { contactsId, messageId } = data;
      const sequelizeInstance = await initSequelize();
      const { Message, Contact, Category, MessageConfig } =
        sequelizeInstance.models;

      const message = await Message.findByPk(messageId, {
        attributes: ["message"],
        include: [
          {
            model: Category,
            attributes: ["categorie_name"],
            through: { attributes: [] }, // 👈 ocultar tabla intermedia
          },
        ],
        raw: true,
      });

      const contacts = await Contact.findAll({
        where: {
          id: contactsId,
          email_status: ["valid", "pending"],
        },
        attributes: ["email"],
        raw: true,
      });

      const recipients = contacts?.map((c) => c?.email);
      const categories = message?.Categories?.map((c) => c.categorie_name);
      // // console.log(recipients)

      const service = new SendEmailService();
      const rta = await service
        .sendEmail({
          message: message?.message,
          recipient: recipients,
        })
        .then(async (resp) => {
          const scheduled_date = new Date(Date.now());

          const result = {
            success: true,
            sent: [],
            failed: [],
          };

          if (!resp?.messageId) {
            return {
              success: false,
              error: "Email server did not return a messageId",
            };
          }

          /* Mensajes enviados correctamente */
          if (Array.isArray(resp.accepted) && resp.accepted.length > 0) {
            for (const recipient of resp.accepted) {
              await MessageConfig.create(
                {
                  message: message?.message,
                  categories,
                  recipient,
                  scheduled_date: scheduled_date,
                  status: "sended",
                  userId: req.user.id,
                  MessageId: messageId,
                },
                { hooks: false },
              );
              result.sent.push(recipient);
            }
          }

          /* Mensajes rechazados */
          if (Array.isArray(resp.rejected) && resp.rejected.length > 0) {
            for (const recipient of resp.rejected) {
              await MessageConfig.create(
                {
                  message: message?.message,
                  categories,
                  recipient,
                  scheduled_date: scheduled_date,
                  status: "error",
                  userId: req.user.id,
                  MessageId: messageId,
                },
                {
                  hooks: false,
                },
              );

              result.failed.push({
                recipient,
                error: "Rejected by mail server",
              });
            }

            result.success = false; // envío parcial o fallido
          }

          /* Respuesta clara para el frontend */
          res.json({
            success: result.success,
            message: result.success
              ? "Message sent successfully"
              : "Some messages could not be sent",
            summary: {
              total: resp.accepted.length + resp.rejected.length,
              sent: result.sent.length,
              failed: result.failed.length,
            },
            details: result,
          });
        });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
