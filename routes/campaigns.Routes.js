const express = require("express");
const { verifyToken } = require("../middlewares/auth.handler");
const {
  validateCampaignLaunch,
} = require("../middlewares/validateCampaignToLaunch");
const { Campaign } = require("../services/campaigns.service");
const {
  CampaignsRecipients,
} = require("../services/campaigns.recipients.service");
const { CampaignsMessages } = require("../services/campaigs_messages.service");
const {
  CampaignDuplicateService,
} = require("../services/campaign-duplicate.service");
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
  "/getCampaignMessages/:campaignId",
  verifyToken,
  async (req, res, next) => {
    try {
      const camapignMessages = new CampaignsMessages();
      const { campaignId } = req.params;
      const userId = req.user.id;
      const existCampaign = await service.getCamapignId(campaignId, userId);

      if (!existCampaign) {
        throw new Error("This Camapign does not exist");
      }

      const messages =
        await camapignMessages.getCampaignMessagesToLaunch(campaignId);

      res.json({ result: messages });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/launchCampaign",
  verifyToken,
  validateCampaignLaunch,
  async (req, res, next) => {
    try {
      const data = req?.body?.data;
      const { campaignId } = data;
      const rta = await service.updateCampaign({
        id: campaignId,
        status: "active",
      });
      res.json({ result: rta });
    } catch (error) {
      next(error);
    }
  },
);

router.post("/duplicate/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const service = new CampaignDuplicateService();
    const campaign = await service.duplicateCampaign(id, userId);

    res.status(201).json({
      success: true,
      result: campaign,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/addMessagesToCampaign/:id", verifyToken, async (req, res) => {
  try {
    const { id: campaign_id } = req.params;
    const { messageIds } = req.body.data;
    const userId = req.user.id;

    console.log(req.body);
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({
        message: "messageIds must be a non-empty array",
      });
    }

    const service = new CampaignsMessages();

    const result = await service.addMessagesToCampaign(
      {
        campaign_id,
        messageIds,
      },
      userId,
    );

    return res.status(201).json({
      message: "Messages added to campaign successfully",
      result: result,
    });
  } catch (error) {
    console.error("Add messages to campaign error:", error);

    return res.status(400).json({
      message: error.message || "Error adding messages to campaign",
    });
  }
});

router.delete("/messages", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const service = new CampaignsMessages();
    const result = await service.deleteMessagesFromCampaign(
      req.body.data,
      userId,
    );
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting message to campaign",
    });
  }
});

router.get("/getCampaignStats", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const rta = await service.getCampaignStatsByUser(userId);
    res.json({
      success: true,
      result: rta,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/getCamapignsDetails", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const rta = await service.getCamapignsDetails(userId);
    res.json({
      success: true,
      result: rta,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/simulate/:id", verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const rta = await service.simulateCampaign(id, userId);
    res.json({
      success: true,
      result: rta,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
