require("dotenv").config();
const { initSequelize } = require("../libs/sequelize");

class VerifyTokenService {
  async _getModels() {
    const sequelize = await initSequelize();
    return sequelize.models;
  }

  async verifyToken(token) {
    const { verification_token } = await this._getModels();
    const rta = await verification_token.findOne({
      attributes: ["expiresAt", "userId"],
      where: { token: token },
    });
    return rta;
  }

  async verifyUser(userId) {
    const { User } = await this._getModels();
    const rta = await User.update(
      {
        active: true,
      },
      {
        where: {
          id: userId,
        },
      },
    );
    return rta;
  }

  async updateVerifyToken(token) {
    const { verification_token } = await this._getModels();
    console.log("El token a actualizar es " + token);
    const rta = await verification_token.update(
      {
        verified: true,
      },
      {
        where: {
          token: token,
        },
      },
    );
    return rta;
  }
}

module.exports = { VerifyTokenService };
