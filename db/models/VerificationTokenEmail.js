const { Model, DataTypes, Sequelize } = require("sequelize");
const VERIFICATION_TOKEN_TABLE = "VerificationToken";

const VerificationTokenModel = {
  token: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
};

class VerificationToken extends Model {
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    this.hasOne(models.VerificationToken, {
      foreignKey: "userId",
      as: "verificationToken",
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: VERIFICATION_TOKEN_TABLE,
      modelName: "VerificationToken",
      timestamps: true,
      paranoid: true,
    };
  }
}

module.exports = { VerificationToken, VerificationTokenModel };
