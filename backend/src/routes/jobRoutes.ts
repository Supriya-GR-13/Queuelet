import { Router } from "express";
import { createJob, getJobs,getJobById,deleteJob } from "../controllers/jobController";

const router = Router();

router.post("/", createJob);
router.get("/", getJobs);
router.get("/:id", getJobById);
router.delete("/:id", deleteJob);

export default router;