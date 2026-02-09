const { initSequelize } = require("../libs/sequelize");
const { Op } = require("sequelize");

const handleLimitRecipients = async (req, res, next) => {
  const max = 10;
  const { contactsId } = req.body?.data || {};

  if (!Array.isArray(contactsId)) {
    return res.status(400).json({
      success: false,
      error: "contactsId must be an array",
      code: 400,
    });
  }

  if (contactsId.length > max) {
    console.log("Demasiados contactos");
    return res.status(422).json({
      success: false,
      code: "RECIPIENT_LIMIT",
      error: `Instant send is limited to ${max} recipients. Please use a campaign for larger audiences.`,
    });
  }

  next();
};

const handleCoolDown = async (req, res, next) => {
  const sequelize = await initSequelize();
  const { MessageConfig } = sequelize.models;
  const lastMessageSended = await MessageConfig.findOne({
    where: {
      UserId: req.user.id,
      status: ["error", "sended"],
      channel: "Email",
    },
    order: [[sequelize.literal("scheduled_date"), "DESC"]],
    raw: true,
    attributes: ["scheduled_date"],
  });

  console.log(lastMessageSended);

  if (!lastMessageSended) return next();

  const lastMessageTime = new Date(lastMessageSended?.scheduled_date).getTime();
  const currentTime = new Date().getTime();
  const cooldownMs = 120000;

  console.log("Hora actual: " + currentTime);
  console.log("Hora de último mensaje enviado:: " + lastMessageTime);

  if (currentTime < lastMessageTime + cooldownMs) {
    console.log("No se puede enviar");
    return res.status(429).json({
      // 429 es el status correcto para "Too Many Requests"
      code: "COOLDOWN_ACTIVE",
      success: false,
      error:
        "You’ve sent a message recently. Please wait 2 minutes before sending another.",
    });
  }

  next();
};

const dailySendLimit = async (req, res, next) => {
  const max = 10;
  // Definir el inicio y fin del día de hoy
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const sequelize = await initSequelize();
  const { MessageConfig } = sequelize.models;
  const countMessageSended = await MessageConfig.findAndCountAll({
    where: {
      UserId: req.user.id,
      status: ["error", "sended"],
      channel: "Email",
      scheduled_date: {
        [Op.between]: [startOfDay, endOfDay],
      },
    },
    order: [[sequelize.literal("scheduled_date"), "DESC"]],
  });

  if (countMessageSended?.count >= max) {
    return res.status(403).json({
      // 429 es el status correcto para "Too Many Requests"
      code: "DAILY_LIMIT_REACHED",
      success: false,
      error:
        "Daily instant send limit reached (10 messages per  day). You can continue sending using campaigns.",
    });
  }

  next();
};

const handleHighRiskWords = async (req, res, next) => {
  try {
    const { messageId } = req.body?.data || {};
    const sequelize = await initSequelize();
    const { Message, RiskWord } = sequelize.models;

    // 1. Obtener todas las palabras de riesgo activas de la BD
    const riskWordsRecords = await RiskWord.findAll({
      where: { isActive: true },
      attributes: ["word"],
      raw: true,
    });

    // Convertimos a un array simple de strings
    const HIGH_RISK_WORDS = riskWordsRecords.map((r) => r.word);

    // Si no hay palabras configuradas, seguimos adelante
    if (HIGH_RISK_WORDS.length === 0) return next();

    // 2. Buscar el contenido del mensaje
    const messageRecord = await Message.findByPk(messageId, {
      attributes: ["message"],
      raw: true,
    });

    if (!messageRecord) {
      return res
        .status(404)
        .json({ success: false, error: "Message not found" });
    }

    const content = messageRecord.message.toUpperCase();

    // 3. Comparación
    const foundWords = HIGH_RISK_WORDS.filter((word) => content.includes(word));

    if (foundWords.length > 0) {
      return res.status(200).json({
        success: false,
        warning: true,
        code: "HIGH_RISK_WORDS_DETECTED",
        error: "This message contains words that may reduce deliverability.",
        details: foundWords.join(", "),
      });
    }

    next();
  } catch (error) {
    console.error("Error in high risk words middleware:", error);
    next(error); // Pasamos al manejador de errores global
  }
};

const { Op } = require("sequelize");
const { initSequelize } = require("../libs/sequelize");

const handleRepetitiveContent = async (req, res, next) => {
  try {
    const { messageId, contactsId } = req.body?.data || {};
    const sequelize = await initSequelize();
    const { MessageConfig } = sequelize.models;

    // Configuración del umbral
    const MAX_REPETITIONS = 5; // Máximo 5 envíos instantáneos del mismo mensaje
    const TIME_WINDOW_MINUTES = 5;
    const lookbackDate = new Date(Date.now() - TIME_WINDOW_MINUTES * 60000);

    // 1. Contamos cuántas veces se ha enviado este mensaje específico hoy
    // en la ventana de tiempo definida
    const repetitionCount = await MessageConfig.count({
      where: {
        message_id: messageId, // Asegúrate de tener esta relación o usa el texto
        status: "sended",
        scheduled_date: {
          [Op.gte]: lookbackDate,
        },
        channel: "Email",
      },
    });

    // 2. Si las repeticiones + los nuevos contactos exceden el límite
    // O si ya se repitió mucho el mismo ID
    if (repetitionCount >= MAX_REPETITIONS) {
      return res.status(422).json({
        success: false,
        code: "REPETITIVE_CONTENT_LIMIT",
        error:
          "This content has been sent multiple times recently. To prevent spam filters, please use the Campaign module for mass delivery.",
      });
    }

    next();
  } catch (error) {
    console.error("Error in repetitive content middleware:", error);
    next(error);
  }
};

module.exports = {
  handleLimitRecipients,
  handleCoolDown,
  dailySendLimit,
  handleHighRiskWords,
  handleRepetitiveContent,
};
