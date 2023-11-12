const { models } = require("../libs/sequelize");
const { Op, DataTypes } = require("sequelize");

class MessageConfigService {
  async find() {
    const rta = await models.MessageConfig.findAndCountAll();
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
            { send_to: { [Op.substring]: [contact] } },
            {
              send_on_date: {
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
              { send_to: { [Op.substring]: [contact] } },
              {
                send_on_date: {
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
        send_to: contact,
        userId: data.user_id,
        ...data,
      });
      if (rta.message_id) {
        result.rowsInserted += 1;
      }
    }
    return result;
  }

  async addMEssages(messages) {
    let result = {
      rowsInserted: 0,
      contacts: 0,
    };

    for (const message of messages) {
      let rta;
      for (const contact of message.send_to) {
        result.contacts += 1;
        rta = await models.MessageConfig.create({
          message_id: message.message_id,
          message: message.message,
          categories: message.categories,
          send_on_date: message.send_on_date,
          send_to: contact,
        });
        if (rta.message_id) {
          result.rowsInserted += 1;
        }
      }
    }
    console.log(result);
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
