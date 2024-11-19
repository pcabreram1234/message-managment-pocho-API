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

  async findOne(email) {
    const rta = await models.User.findOne({
      where: {
        email: email,
        active: true,
      },
    });
    return rta;
  }

  async isAdmUser(userId) {
    const rta = await models.User.findOne({
      where: {
        id: userId,
        type_user: "adm",
        active: 1,
      },
    });
    return rta;
  }

  async addUser(data) {
    const { user_name, type_user, password, email, active } = data;
    const userExist = await this.verifyUserExist(email);
    // console.log("El valor de userExist es " + userExist.id);
    if (userExist?.id) {
      return boom.badData(`The email ${email} already exist`);
    }
    const hashedPass = await bcrypt.hash(password, parseInt(saltRounds));
    const rta = await models.User.create({
      user_name: user_name,
      type_user: type_user,
      email: email,
      password: hashedPass,
      active: active,
    });
    return rta.dataValues["id"];
  }

  async editUser(data) {
    const { id, type_user, user_name, email, type_user_request } = data;

    if (type_user_request !== "adm") {
      return boom.unauthorized("Your are not login as an admin");
    }

    const rta = await models.User.update(
      {
        type_user: type_user,
        user_name: user_name,
        email: email,
      },
      { where: { id: id } }
    );
    return rta[0];
  }

  async verifyUserExist(email) {
    const rta = await models.User.findOne({
      where: {
        email: email,
      },
    });
    return rta;
  }

  async deleteUser(data) {
    console.log(data);
    const { idToDelete, user_name_request } = data;
    const isAdmUser = await this.isAdmUser(user_name_request);
    if (!isAdmUser) {
      return boom.badData(`The user ${user_name} is not an admin`);
    }
    console.log(data);
    const rta = await models.User.destroy({
      where: {
        id: idToDelete,
      },
    });
    return rta;
  }
}

module.exports = { UserService };
