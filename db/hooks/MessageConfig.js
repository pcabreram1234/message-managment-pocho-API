const { MessageConfig } = require("../models/MessageCofing");
const { FailedMessage } = require("../models/FailedMessages");
const { User } = require("../models/Users");
const { Message } = require("../models/Messages");
const { ValidationError } = require("sequelize");

const initMessageConfigHooks = async () => {
  MessageConfig.addHook("beforeCreate", async (message, options) => {
    const { dataValues } = message;
    const { scheduled_date, MessageId } = dataValues;

    // console.log("El valor de scheduled_date es:", scheduled_date);

    // Validar que scheduled_date no sea nulo o inválido
    if (!scheduled_date || isNaN(new Date(scheduled_date).getTime())) {
      throw new ValidationError("The scheduled date is invalid.");
    }

    // Obtener la fecha actual del servidor y la fecha seleccionada
    const dateInServer = new Date().getTime();
    const dateSelected = new Date(scheduled_date).getTime();
    // Comparar las fechas
    if (dateSelected < dateInServer) {
      throw new ValidationError(
        "The date must be greater than the current date."
      );
    }
    // console.log(message);

    // Verificar si ya existe un mensaje programado en FailedMessage
    const existMessageScheduled = await FailedMessage.findOne({
      where: {
        message_id: MessageId,
        recipient: message.recipient,
        scheduled_date: message.scheduled_date,
      },
    });

    if (existMessageScheduled !== null) {
      throw new Error("This message is already scheduled.");
    }
    console.log(dataValues);
    // Obtener el ID del usuario asociado al mensaje
    const messageWithUser = await Message.findOne({
      where: { id: MessageId },
    });

    if (!messageWithUser) {
      throw new Error("User associated with the message not found.");
    }
  });

  MessageConfig.addHook("afterCreate", async (message, options) => {
    const userId = message.UserId;

    // Crear el registro en FailedMessage
    await FailedMessage.create({
      message_id: message.MessageId,
      user_id: userId,
      recipient: message.recipient,
      message_content: message.message,
      scheduled_date: message.scheduled_date,
      MessageConfig_Id: message.id,
    });

    console.log("Registro creado en FailedMessage.");
  });
};

module.exports = { initMessageConfigHooks };
