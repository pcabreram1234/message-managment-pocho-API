const { models } = require("../libs/sequelize");
const { Op, DataTypes } = require("sequelize");

class MessageConfigService {
  async find(id) {
    const rta = await models.MessageConfig.findAndCountAll({
      where: { UserId: id },
      include: [{ all: true }],
    });
    return rta;
  }

  async findOne(id) {
    const rta = await models.MessageConfig.findByPk(id);
    return rta;
  }

  async findExistentMessage(data) {
    let result = { rows: [], count: 0 };
    const { MessageId, send_to, send_on_date } = data;
    const dateToCompare = send_on_date.toString().slice(0, 10);
    for (const contact of send_to) {
      const rta = await models.MessageConfig.findAndCountAll({
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
    let result = { rows: [], count: 0 };
    for (const message of messages) {
      const dateToCompare = message.send_on_date.toString().slice(0, 10);
      for (const contact of message.send_to) {
        const rta = await models.MessageConfig.findAndCountAll({
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
    console.log(data);
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
    for (const contact of send_to) {
      const rta = await models.MessageConfig.create({
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
      console.log(data.messages);
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
      for (const contact of message.send_to) {
        result.contacts += 1;
        rta = await models.MessageConfig.create({
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
    const row = await models.MessageConfig.findAndCountAll({
      where: { id: rta.getDataValue(attr) },
    });
    return row.count;
  }

  async getUserStatistics(id) {
    const [sendedMessages, scheduledMessages, failedMessages, allMessages] =
      await Promise.all([
        models.MessageConfig.count({
          where: { status: "sended", UserId: id },
        }),
        models.MessageConfig.count({
          where: { status: "pending", UserId: id },
        }),
        models.FailedMessage.count({
          where: {
            status: { [Op.in]: ["Error", "Permanent Failure"] },
            user_id: id, // si aplica también el userId
          },
        }),
        models.Message.count({
          where: { UserId: id },
        }),
      ]);

    return {
      allMessages: allMessages,
      sended: sendedMessages,
      scheduled: scheduledMessages,
      failed: failedMessages,
    };
  }
}

module.exports = { MessageConfigService };
