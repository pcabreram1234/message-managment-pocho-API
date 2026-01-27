const { Campaign } = require("../models/Campaigns");
const { CampaignMessage } = require("../models/CampaignMessages");
const { CampaignRecipient } = require("../models/CampaignRecipients");

const STATUS_MAP = {
  pending: {
    message: "pending",
  },
  active: {
    message: "sending",
  },
  paused: {
    message: "pending",
  },
  completed: {
    message: "completed",
  },
  cancelled: {
    message: "cancelled",
  },
};

const initCampaignHooks = async () => {
  Campaign.addHook("afterUpdate", async (campaign, options) => {
    const fieldsToSync = [
      "send_strategy",
      "send_interval_value",
      "send_interval_unit",
      "max_retries",
      "retry_delay_minutes",
      "status",
      "name",
      "description",
      "category",
      "start_date",
      "end_date",
    ];

    const hasRelevantChanges = fieldsToSync.some((field) =>
      campaign.changed(field),
    );

    if (!hasRelevantChanges) return;

    const newStatus = campaign.status;
    const statusConfig = STATUS_MAP[newStatus];
    const { message } = statusConfig;

    await CampaignMessage.update(
      {
        send_strategy: campaign.send_strategy,
        send_interval_value: campaign.send_interval_value,
        send_interval_unit: campaign.send_interval_unit,
        max_retries: campaign.max_retries,
        retry_delay_minutes: campaign.retry_delay_minutes,
        status: message,
      },
      {
        where: { campaign_id: campaign.id },
        transaction: options.transaction,
      },
    );

    // 2.2 Cambiar estado de recipients a "active"
    await CampaignRecipient.update(
      { status: newStatus },
      {
        where: {
          campaign_id: campaign.id,
        },
        transaction: options.transaction,
      },
    );
  });

  Campaign.addHook("beforeDestroy", async (campaign, options) => {
    if (["active", "completed"].includes(campaign.status)) {
      throw new Error(
        `Campaign in status "${campaign.status}" cannot be deleted`,
      );
    }

    const sentMessagesCount = await CampaignMessage.count({
      where: {
        campaign_id: campaign.id,
        status: "sent",
      },
      transaction: options.transaction,
    });

    if (sentMessagesCount > 0) {
      throw new Error("Campaign with sent messages cannot be deleted");
    }
  });

  Campaign.addHook("afterDestroy", async (campaign, options) => {
    await CampaignMessage.destroy({
      where: { campaign_id: campaign.id },
      transaction: options.transaction,
    });

    await CampaignRecipient.destroy({
      where: { campaign_id: campaign.id },
      transaction: options.transaction,
    });
  });
};

module.exports = { initCampaignHooks };
