const { models } = require("../libs/sequelize");
const { Op, DataTypes } = require("sequelize");

class MessageConfigService {
  async find(id) {
    const rta = await models.MessageConfig.findAndCountAll({
      where: { UserId: id },
    });
    return rta;
  }

  async findOne(id) {
    const rta = await models.MessageConfig.findByPk(id);
    return rta;
  }

  async findExistentMessage(data) {
    let result = { rows: [], count: 0 };
    const { message_id, send_to, send_on_date } = data;
    const dateToCompare = send_on_date.toString().slice(0, 10);
    for (const contact of send_to) {
      const rta = await models.MessageConfig.findAndCountAll({
        where: {
          [Op.and]: [
            { message_id: message_id },
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
              { message_id: message.message_id },
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

    const { send_to } = data;
    for (const contact of send_to) {
      const rta = await models.MessageConfig.create({
        ...data,
        recipient: contact.email,
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
      let rta;
      for (const contact of message.send_to) {
        result.contacts += 1;
        rta = await models.MessageConfig.create({
          ...message,
          recipient: contact,
          UserId: data.UserId,
        });
        if (rta.message_id) {
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
}

module.exports = { MessageConfigService };
