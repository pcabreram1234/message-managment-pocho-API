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
        "The date must be greater than the current date.",
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
    if (message?.dataValues?.length === 1) {
      console.log("Iniciando el hook AfterCreate");
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
      console.log("Finalizando el hook AfterCreate");
    }
  });

  MessageConfig.addHook("afterBulkCreate", async (messages, options) => {
    if (messages?.length > 1) {
      console.log("Activando hook afterBulkCreate en tabla MessageConfig");
      const bulkFailedMessages = messages
        ?.map((message) => ({
          message_id: message.dataValues.MessageId,
          user_id: message.dataValues.UserId,
          recipient: message.dataValues.recipient,
          message_content: message.dataValues.message,
          scheduled_date: message.dataValues.scheduled_date,
          MessageConfig_Id: message.dataValues.id,
        }))
        .filter((m) => m.message_id);
      console.log(
        "La cantidad de mensajes para ingresar son: " +
          bulkFailedMessages.length,
      );
      await FailedMessage.bulkCreate(bulkFailedMessages, {
        ignoreDuplicates: true,
        transaction: options.transaction,
      });
      console.log("Finalizando hook afterBulkCreate en tabla MessageConfig");
    }
  });
};

module.exports = { initMessageConfigHooks };
