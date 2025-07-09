const { models } = require("../libs/sequelize");
const { MessageService } = require("../services/message.service");

class CampaignsMessages {
  async getCampaignMessagesToLaunch(campaign_id) {
    const rta = await models.CampaignMessage.findAll({
      where: {
        campaign_id: campaign_id,
      },
      include: [
        {
          model: models.Campaign,
          attributes: [],
          include: [
            {
              model: models.CampaignRecipient,
              attributes: [],
              include: [
                {
                  model: models.Contact,
                  attributes: ["email"],
                  required: true,
                },
              ],
            },
          ],
        },
      ],
      attributes: [
        "content",
        "channel",
        "Campaign.CampaignRecipients.Contact.email",
        "MessageId",
      ],
      raw: true,
    });

    let obj = [];
    const messageService = new MessageService();

    for (const key in rta) {
      const content = rta[key]?.content;
      const email = rta[key]?.email;
      const channel = rta[key]?.channel;
      const MessageId = rta[key]?.MessageId;
      const categories = await messageService.getCategoriesAsociate(MessageId);
      obj.push({
        message_content: content,
        recipient: email,
        channel: channel,
        MessageId: MessageId,
        categories: categories,
      });
    }

    return obj;
  }
}

module.exports = { CampaignsMessages };
