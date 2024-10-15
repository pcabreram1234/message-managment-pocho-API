require("dotenv").config();
const { models } = require("../libs/sequelize");
const { Op, or } = require("sequelize");
const bcrypt = require("bcrypt");
const saltRounds = process.env.SALT_ROUNDS;
const boom = require("@hapi/boom");

class UserService {
  async find() {
    const rta = await models.User.findAll({
      attributes: {
        exclude: [
          "createdAt",
          "password",
          "session_logout",
          "token",
          "token_active",
          "updatedAt",
        ],
      },
    });
    return rta;
  }

  async findOne(user_name) {
    const rta = await models.User.findOne({
      where: {
        user_name: user_name,
        active: true,
      },
    });
    return rta;
  }

  async isAdmUser(data) {
    const { user_name } = data;
    const rta = await models.User.findOne({
      where: {
        user_name: user_name,
        type_user: "adm",
        active: 1,
      },
    });
    return rta;
  }

  async addUser(data) {
    const { user_name, type_user, password, email } = data;
    const userExist = await this.verifyUserExist(user_name, email);
    if (userExist) {
      return boom.badData(
        `The user ${user_name} or the email ${email} already exist`
      );
    }
    const hashedPass = await bcrypt.hash(password, parseInt(saltRounds));
    const rta = await models.User.create({
      user_name: user_name,
      type_user: type_user,
      email: email,
      password: hashedPass,
    });
    return rta.dataValues["id"];
  }

  async editUser(data) {
    const { id, type_user, user_name, email, type_user_request } = data;

    if (type_user_request !== "adm") {
      return boom.unauthorized("Your are not login as an admin");
    }

    const existUser = await models.User.findOne({
      where: {
        id: {
          [Op.ne]: [id],
        },
        [Op.or]: [{ user_name: user_name }, { email: email }],
      },
    });

    if (existUser !== null) {
      return boom.conflict(
        `The user ${user_name} and/or the email ${email} already exist`
      );
    } else {
      console.log(existUser);
      const rta = await models.User.update(
        {
          type_user: type_user,
          user_name: user_name,
          email: email,
        },
        { where: { id: id } }
      );
      return rta;
    }
  }

  async verifyUserExist(user_name, email) {
    const rta = await models.User.findOne({
      where: {
        [Op.or]: [{ user_name: user_name }, { email: email }],
      },
    });
    return rta;
  }

  async deleteUser(data) {
    const { idToDelete, user_name_request } = data;
    const isAdmUser = this.isAdmUser(user_name_request);
    if (isAdmUser) {
      return boom.badData(`The user ${user_name} already exists`);
    }

    const rta = await models.User.destroy({
      where: {
        id: idToDelete,
      },
    });
    return rta;
  }
}

module.exports = { UserService };
