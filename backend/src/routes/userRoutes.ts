import { Router } from "express";
import { loginOrCreateUser, getUserById } from "../controllers/userController";

const router = Router();

router.post("/login", loginOrCreateUser);
router.get("/:id", getUserById);

export default router;
