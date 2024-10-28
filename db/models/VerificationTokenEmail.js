const { Model, DataTypes, Sequelize } = require("sequelize");
const VERIFICATION_TOKEN_TABLE = "verification_tokens";

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
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
};

class VerificationToken extends Model {
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    this.hasOne(models.verification_token, {
      foreignKey: "userId",
      as: "verificationToken",
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: VERIFICATION_TOKEN_TABLE,
      modelName: "verification_token",
      timestamps: true,
      paranoid: true,
    };
  }
}

module.exports = { VerificationToken, VerificationTokenModel };
