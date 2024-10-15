const { MessageConfig } = require("../models/MessageCofing");
const { FailedMessage } = require("../models/FailedMessages");
const { User } = require("../models/Users");
const { Message } = require("../models/Messages");

const initMessageConfigHooks = async () => {
  MessageConfig.addHook("beforeCreate", async (message, options) => {
    const existMessageScheduled = await FailedMessage.findOne({
      where: {
        message_id: message.message_id,
        recipient: message.recipient,
        scheduled_date: message.scheduled_date,
      },
    });

    if (existMessageScheduled !== null) {
      throw new Error("This message is already scheduled");
    } else {
      const existMessage = await FailedMessage.findOne({
        where: {
          message_id: message.message_id,
          recipient: message.recipient,
          scheduled_date: message.scheduled_date,
        },
      });

      if (existMessage === null) {
        const userId = await Message.findOne({
          where: { id: message.message_id },
          include: {
            model: User,
            attributes: ["id"], // Solo obtener el id del usuario
          },
        });

        console.log("El valor de userId es " + userId);

        console.log(userId);
        await FailedMessage.create({
          message_id: message.message_id,
          user_id: userId.User.id,
          recipient: message.recipient,
          message_content: message.message,
          scheduled_date: message.scheduled_date,
        }).then(() => {
          console.log("Registro creado");
        });
      } else {
        console.log("Ya existe este registro");
      }
    }
  });
};

module.exports = { initMessageConfigHooks };
