const { models } = require("../libs/sequelize");
const { Op } = require("sequelize");

class CampaignsRecipients {
  async syncCamapignsRecipients(data) {
    const { recipients, id, status } = data;
    const newIds = recipients?.map((c) => c.value);
    const existingRecipients = await models.CampaignRecipient.findAll({
      attributes: ["ContactId", "status"],
      where: {
        campaign_id: id,
      },
      raw: true,
    });

    let existingId = [];

    for (const r in existingRecipients) {
      existingId.push(existingRecipients[r].ContactId);
    }

    const recipientsToInsert = newIds.filter((id) => !existingId.includes(id));
    const recipientsToDelete = existingId.filter((id) => !newIds.includes(id));
    const recordsToInsert = recipientsToInsert?.map((r) => ({
      status: "pending",
      campaign_id: id,
      ContactId: r,
    }));
    console.log(existingRecipients[0]?.status);

    const recipientsDeleted = await models.CampaignRecipient.destroy({
      attributes: ["ContactId"],
      where: {
        campaign_id: id,

        ContactId: {
          [Op.in]: recipientsToDelete,
        },
      },
    });

    const recipientsInserted = await models.CampaignRecipient.bulkCreate(
      recordsToInsert
    );

    return {
      recipientsDeleted: recipientsDeleted,
      recipientsInserted: recipientsInserted?.length,
    };
  }
}

module.exports = { CampaignsRecipients };
