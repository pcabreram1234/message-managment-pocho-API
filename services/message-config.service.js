require("dotenv").config();
const { initSequelize } = require("../libs/sequelize");
const { Op, literal, fn } = require("sequelize");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const days = require("dayjs");

class MessageConfigService {
  async _getModels() {
    const sequelize = await initSequelize();
    return sequelize.models;
  }

  async find(id) {
    const { MessageConfig } = await this._getModels();
    const rta = await MessageConfig.findAndCountAll({
      where: { UserId: id },
      include: [{ all: true }],
    });
    return rta;
  }

  async findOne(id) {
    const { MessageConfig } = await this._getModels();
    const rta = await MessageConfig.findByPk(id);
    return rta;
  }

  async findSendedMessages(userId) {
    const { MessageConfig } = await this._getModels();
    const rta = await MessageConfig.findAndCountAll({
      where: {
        UserId: userId,
      },
    });
    return rta;
  }

  async findMessagesSendedPerWeek(userId) {
    const { MessageConfig } = await this._getModels();
    const rta = await MessageConfig.findAll({
      where: {
        status: "sended",
        UserId: userId,
      },
      attributes: [
        [
          literal(
            `CONCAT(YEAR(scheduled_date), '-W', LPAD(WEEK(scheduled_date, 3), 2, '0'))`,
          ),
          "week",
        ],
        [fn("COUNT", "*"), "count"],
      ],
      group: [
        literal(
          `CONCAT(YEAR(scheduled_date), '-W', LPAD(WEEK(scheduled_date, 3), 2, '0'))`,
        ),
      ],
      order: [literal(`MIN(scheduled_date) ASC`)],
      raw: true,
    });

    return rta;
  }

  async findExistentMessage(data) {
    const { MessageConfig } = await this._getModels();
    let result = { rows: [], count: 0 };
    const { MessageId, send_to, send_on_date } = data;
    const dateToCompare = send_on_date.toString().slice(0, 10);
    for (const contact of send_to) {
      const rta = await MessageConfig.findAndCountAll({
        where: {
          [Op.and]: [
            { MessageId: MessageId },
            { recipient: { [Op.substring]: [contact] } },
            {
              scheduled_date: {
                [Op.substring]: [dateToCompare],
              },
            },
          ],
        },
      });
      if (rta.count > 0) {
        result.count += rta.count;
        rta.rows.forEach((row) => {
          result.rows.push(row);
        });
      }
    }
    return result;
  }

  async findExistentMessages(messages) {
    const { MessageConfig } = await this._getModels();
    let result = { rows: [], count: 0 };
    for (const message of messages) {
      const dateToCompare = message.send_on_date.toString().slice(0, 10);
      for (const contact of message.send_to) {
        const rta = await MessageConfig.findAndCountAll({
          where: {
            [Op.and]: [
              { MessageId: message.MessageId },
              { recipient: { [Op.substring]: [contact] } },
              {
                scheduled_date: {
                  [Op.substring]: [dateToCompare],
                },
              },
            ],
          },
        });
        if (rta.count > 0) {
          result.count += rta.count;
          rta.rows.forEach((row) => {
            result.rows.push(row);
          });
        }
      }
      return result;
    }
  }

  async addMessage(data) {
    let result = {
      rowsInserted: 0,
    };

    const isEmptyRecipient = data?.send_to?.length === 0;

    const isEmptyScheduledDate =
      data.send_on_date === "" ||
      data.send_on_date === null ||
      data.send_on_date === undefined;

    if (isEmptyRecipient) {
      throw new Error("The recipient is required.");
    }

    if (isEmptyScheduledDate) {
      throw new Error("The scheduled date is invalid.");
    }

    const { send_to } = data;
    const { MessageConfig } = await this._getModels();
    for (const contact of send_to) {
      const rta = await MessageConfig.create({
        ...data,
        recipient: contact.email,
        scheduled_date: data.send_on_date,
      });

      if (rta.id) {
        result.rowsInserted += 1;
      }
    }

    return result;
  }

  async addMEssages(data) {
    let result = {
      rowsInserted: 0,
      contacts: 0,
    };

    for (const message of data.messages) {
      const isEmptyRecipient = message?.send_to?.length === 0;

      const isEmptyScheduledDate =
        message.send_on_date === "" ||
        message.send_on_date === null ||
        message.send_on_date === undefined;

      if (isEmptyRecipient) {
        throw new Error("The recipient is required.");
      }

      if (isEmptyScheduledDate) {
        throw new Error("The scheduled date is invalid.");
      }
      let rta;
      const { MessageConfig } = await this._getModels();
      for (const contact of message.send_to) {
        result.contacts += 1;
        rta = await MessageConfig.create({
          ...message,
          recipient: contact,
          UserId: data.UserId,
          scheduled_date: message.send_on_date,
        });
        if (rta.MessageId) {
          result.rowsInserted += 1;
        }
      }
    }
    return result;
  }

  async returnRowCount(attr, rta) {
    const { MessageConfig } = await this._getModels();
    const row = await MessageConfig.findAndCountAll({
      where: { id: rta.getDataValue(attr) },
    });
    return row.count;
  }

  async getUserStatistics(id) {
    const { MessageConfig, FailedMessage, Message, Contact, Campaign } =
      await this._getModels();
    const [
      sendedMessages,
      scheduledMessages,
      failedMessages,
      allMessages,
      contacts,
      activeCampaigns,
      pausedCampaigns,
    ] = await Promise.all([
      MessageConfig.count({
        where: { status: "sended", UserId: id },
      }),
      MessageConfig.count({
        where: { status: "pending", UserId: id },
      }),
      FailedMessage.count({
        where: {
          status: { [Op.in]: ["Error", "Permanent Failure"] },
          user_id: id, // si aplica también el userId
        },
      }),
      Message.count({
        where: { UserId: id },
      }),
      Contact.count({ where: { UserId: id } }),
      Campaign.count({ where: { status: "active", UserId: id } }),
      Campaign.count({ where: { status: "paused", UserId: id } }),
    ]);

    return {
      allMessages: allMessages,
      sended: sendedMessages,
      scheduled: scheduledMessages,
      failed: failedMessages,
      Contacts: contacts,
      ActiveCampaigns: activeCampaigns,
      PausedCampaigs: pausedCampaigns,
    };
  }

  async findMessagesAboutToSent(userId) {
    const { MessageConfig } = await this._getModels();
    const rta = await MessageConfig.findAll({
      where: {
        UserId: userId,
        status: "pending",
      },
      attributes: ["message", "scheduled_date", "recipient", "status"],
      order: [["scheduled_date", "ASC"]],
    });

    return rta;
  }

  async scheduleMessages(data) {
    const { MessageConfig, Contact, Message } = await this._getModels();
    let result = {
      rowsInserted: 0,
    };
    const { userId, message, contacts, startDate, endDate, categories } = data;
    const formatedStartDate = days(startDate);
    const formatedEndDate = days(endDate);
    const daysToScheduled = formatedEndDate.diff(formatedStartDate, "days");
    const now = days();

    for (let index = 0; index <= daysToScheduled; index++) {
      const currentDate = formatedStartDate.add(index, "day");
      const currentDateTime = currentDate
        .hour(now.hour())
        .minute(now.minute())
        .second(now.second())
        .add("30", "seconds")
        .millisecond(now.millisecond());

      for (const contact of contacts) {
        const recipient = await Contact.findByPk(contact, {
          attributes: ["email"],
        });
        const saveMessage = await Message.findAll({
          attributes: ["message", "id"],
          where: {
            id: message,
          },
        });

        for (const m of saveMessage) {
          const newScheduledMessage = await MessageConfig.create({
            UserId: userId,
            message: m?.message,
            MessageId: m?.id,
            recipient: recipient.email,
            scheduled_date: currentDateTime,
            categories: categories,
          });
          const { id } = newScheduledMessage.dataValues;
          if (id) {
            console.log("Se le debe subir uno al contador");
            result.rowsInserted += 1;
          }
        }
      }
    }

    return result;
  }

  async schduleCustomMessage(data) {
    let result = {
      rowsInserted: 0,
    };
    const {
      userId,
      message,
      contacts,
      startDate,
      endDate,
      saveMessage,
      categories,
    } = data;

    let messageId = null;

    const { Message, Contact, MessageConfig } = await this._getModels();
    if (saveMessage) {
      const messageToSave = Message.create({
        UserId: userId,
        message: message,
      });
      const { id } = (await messageToSave).dataValues;
      messageId = id;
    }

    const formatedStartDate = days(startDate);
    const formatedEndDate = days(endDate);
    const daysToScheduled = formatedEndDate.diff(formatedStartDate, "days");
    const now = days();

    for (let index = 0; index <= daysToScheduled; index++) {
      const currentDate = formatedStartDate.add(index, "day");
      const currentDateTime = currentDate
        .hour(now.hour())
        .minute(now.minute())
        .second(now.second())
        .add("30", "seconds")
        .millisecond(now.millisecond());

      for (const contact of contacts) {
        const recipient = await Contact.findByPk(contact, {
          attributes: ["email"],
        });

        const newScheduledMessage = await MessageConfig.create(
          {
            UserId: userId,
            message: message,
            MessageId: messageId ?? null,
            recipient: recipient.email,
            scheduled_date: currentDateTime,
            categories: categories,
          },
          { hooks: saveMessage },
        );
        const { id } = newScheduledMessage.dataValues;
        if (id) {
          console.log("Se le debe subir uno al contador");
          result.rowsInserted += 1;
        }
      }
    }
    return result;
  }

  async sendMessage(data) {
    const { FailedMessage, MessageConfig } = await this._getModels();
    const { failedMessageId, messageConfigId, userId } = data;
    const whereClause = {
      id: failedMessageId,
      user_id: userId,
    };
    console.log("El valor de messageConfigId es: " + messageConfigId);
    console.log(typeof messageConfigId);

    if (messageConfigId !== null && messageConfigId !== "null") {
      whereClause.MessageConfig_Id = messageConfigId;
    }

    console.log(whereClause);

    const rta = await FailedMessage.findOne({
      where: whereClause,
      attributes: [
        "id",
        "message_id",
        "user_id",
        "recipient",
        "message_content",
        "attempts",
      ],
    });

    console.log(rta.attempts);

    // Crear el transportador con la configuración necesaria
    const transporter = nodemailer.createTransport({
      port: process.env.NODEMAILER_PORT,
      host: process.env.NODEMAILER_HOST,
      secure: true,
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
      "mail_template.html",
    );
    let emailTemplate = fs.readFileSync(templatePath, "utf8");

    emailTemplate = emailTemplate.replace(
      "{{MENSAJE_PROGRAMADO}}",
      rta?.message_content,
    );

    // Enviar el correo de forma asincrónica
    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_FROM, // Dirección del remitente
      to: rta?.recipient, // Dirección de destino
      subject: "PMMS - Pocho`s Messages Managment System", // Asunto del correo
      text: rta?.message_content.toString(),
      html: emailTemplate,
    });

    if (info.messageId) {
      if (messageConfigId !== null && messageConfigId !== "null") {
        const updateMessageConfig = await MessageConfig.update(
          {
            status: "sended",
          },
          { where: { id: messageConfigId } },
        );
      }
      const updateFailedMessage = await FailedMessage.update(
        {
          status: "Sended",
          attempts: rta.attempts + 1,
        },
        {
          where: whereClause,
        },
      );
      return { result: "Message Sended" };
    }
  }

  async scheduleMessagesToLaunchCamapign(messages) {
    const { MessageConfig } = await this._getModels();
    const rta = await MessageConfig.bulkCreate(messages, {
      validate: true,
    });
    return rta;
  }
}

module.exports = { MessageConfigService };
