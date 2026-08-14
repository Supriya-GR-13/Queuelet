import { Router } from "express";

import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaignStatus,
  deleteCampaign,
  addCampaignJobs
} from "../controllers/campaignController";

const router = Router();

router.post("/", createCampaign);

router.get("/", getCampaigns);

router.get("/:id", getCampaignById);

router.patch("/:id/status", updateCampaignStatus);

router.delete("/:id", deleteCampaign);

router.post("/:campaignId/jobs", addCampaignJobs);

export default router;