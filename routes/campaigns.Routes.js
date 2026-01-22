const express = require("express");
const { verifyToken } = require("../middlewares/auth.handler");
const { Campaign } = require("../services/campaigns.service");
const {
  CampaignsRecipients,
} = require("../services/campaigns.recipients.service");
const { CampaignsMessages } = require("../services/campaigs_messages.service");
const { MessageConfigService } = require("../services/message-config.service");
const router = express.Router();
const service = new Campaign();

router.get(
  "/findTopCampaignsByMessagesSended",
  verifyToken,
  async (req, res, next) => {
    try {
      const id = req.user.id;
      const result = await service.findTopCampaignsByMessagesSended(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/getSuccessErrorRateByCampaign",
  verifyToken,
  async (req, res, next) => {
    try {
      const id = req.user.id;
      const result = await service.getSuccessErrorRateByCampaign(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get("/getCampaignsAboutToSent", verifyToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const result = await service.getCampaignsAboutToSent(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/createCamapign", verifyToken, async (req, res, next) => {
  try {
    const { data } = req.body;
    data.UserId = req.user.id;
    const newCampaign = await service.create(data);
    res.json({ result: newCampaign });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/getCampaingsAndRecipients",
  verifyToken,
  async (req, res, next) => {
    try {
      const id = req.user.id;
      const result = await service.getCampaingsAndRecipients(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/getSelectedRecipientsByCampaign/:campaign_id",
  verifyToken,
  async (req, res, next) => {
    try {
      const id = req.user.id;
      const { campaign_id } = req.params;
      const result = await service.getSelectedRecipientsByCampaign(
        campaign_id,
        id,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.post("/updateCampaign", verifyToken, async (req, res, next) => {
  try {
    const { data } = req.body;
    const services = new CampaignsRecipients();
    const rta = await services.syncCamapignsRecipients(data);
    const campaignUpdate = await service.updateCampaign(data);
    res.json(campaignUpdate?.dataValues ? 1 : 0);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/getCampaignMessages/:campaign_id",
  verifyToken,
  async (req, res, next) => {
    try {
      const camapignMessages = new CampaignsMessages();
      const { campaign_id } = req.params;
      const userId = req.user.id;
      const existCampaign = await service.getCamapignId(campaign_id, userId);

      if (!existCampaign) {
        throw new Error("This Camapign does not exist");
      }

      const messages =
        await camapignMessages.getCampaignMessagesToLaunch(campaign_id);

      if (!messages || messages.length === 0) {
        throw new Error("This Camapign does not have messages associate");
      }
      res.json(messages);
    } catch (error) {
      next(error);
    }
  },
);

router.post("/queueCampaignMessages", verifyToken, async (req, res, next) => {
  try {
    const data = req?.body?.data;
    const userId = req.user.id;
    const messagesToSchedule = data?.map((m) => ({
      UserId: userId,
      message: m?.message_content,
      recipient: m?.recipient,
      scheduled_date: new Date(),
      categories: m?.categories,
      MessageId: m?.MessageId,
      chanel: m?.channel,
    }));
    const service = new MessageConfigService();
    const rta =
      await service.scheduleMessagesToLaunchCamapign(messagesToSchedule);
    res.json({ result: rta?.length });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
