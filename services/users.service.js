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
      return { error: `The email ${email} already exist` };
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

  async editOwnUser(data) {
    const { id, user_name, email, newPassword, oldPassword } = data;

    const user = await models.User.findOne({
      where: { id },
      attributes: ["id", "password"],
    });

    if (!user) {
      throw new Error("User not exists");
    }

    let updatedFields = { user_name, email };

    // Si el usuario quiere cambiar la contraseña
    if (oldPassword && newPassword) {
      console.log("Usuario quiere cambiar su contraseña");
      const isValid = await bcrypt.compare(oldPassword, user.password);
      if (!isValid) {
        throw new Error("Old Password Incorrect");
      }
      const hashedPassword = await bcrypt.hash(
        newPassword,
        parseInt(saltRounds)
      );
      updatedFields.password = hashedPassword;
    }

    const [updatedCount] = await models.User.update(updatedFields, {
      where: { id },
    });

    return updatedCount;
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


  async deleteUserSoft(userId) {
    const user = await models.User.findByPk(userId);

    if (!user) throw new Error('User not exists');

    // Borrar contactos
    await models.Contact.update({ deletedAt: new Date() }, { where: { UserId: userId } });

    // Borrar mensajes
    await models.Message.update({ deletedAt: new Date() }, { where: { UserId: userId } });

    // Borrar configuración de mensajes
    await models.MessageConfig.update({ deletedAt: new Date() }, { where: { UserId: userId } });

    // Borrar mensajes fallidos
    await models.FailedMessage.update({ deletedAt: new Date() }, { where: { user_id: userId } });

    // Borrar tokens
    await models.verification_token.update({ deletedAt: new Date() }, { where: { UserId: userId } });

    // Borrar relaciones many-to-many
    // await models.users_contacts.destroy({where: {UserId: userId,},});

  //  // 1. Buscar los mensajes del usuario
  //   const messages = await models.Message.findAll({
  //     where: { UserId: userId },
  //     attributes: ["id"],
  //   });

  //   // 2. Obtener los IDs de esos mensajes
  //   const messageIds = messages.map((msg) => msg.id);

  //     // 3. Eliminar en messages_contacts los registros relacionados
  //   await models.messages_contacts.destroy({
  //     where: {
  //       MessageId: messageIds, // usa `in` automáticamente
  //     },
  //   });

    // Finalmente marcar el usuario como eliminado
   const rta= await models.User.destroy({where:{id:userId}}) 
   return rta;  

  }

}

module.exports = { UserService };
