import express from "express";
import { getProfile, getUserTransactions, withdraw } from "../controllers/userController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

// All user routes require authentication
router.use(requireAuth);

router.get("/profile", getProfile);
router.get("/transactions", getUserTransactions);
router.post("/withdraw", withdraw);

export default router;