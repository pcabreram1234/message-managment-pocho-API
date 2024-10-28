require("dotenv").config();
const { models } = require("../libs/sequelize");

class VerifyTokenService {
  async verifyToken(token) {
    const rta = await models.verification_token.findOne({
      attributes: ["expiresAt", "userId"],
      where: { token: token },
    });
    return rta;
  }

  async verifyUser(userId) {
    const rta = await models.User.update(
      {
        active: true,
      },
      {
        where: {
          id: userId,
        },
      }
    );
    return rta;
  }

  async updateVerifyToken(token) {
    console.log("El token a actualizar es " + token);
    const rta = await models.verification_token.update(
      {
        verified: true,
      },
      {
        where: {
          token: token,
        },
      }
    );
    return rta;
  }
}

module.exports = { VerifyTokenService };
