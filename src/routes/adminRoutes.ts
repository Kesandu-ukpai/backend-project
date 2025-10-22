import express from "express";
import {
  addFunds,
  getAllUsers,
  getAllEscrowAccounts,
  resolveDispute,
  getSystemStats,
} from "../controllers/adminController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(requireAuth);
router.use(requireAdmin);

// Add funds to user wallet
router.post("/add-funds", addFunds);

// Get all users
router.get("/users", getAllUsers);

// Get all escrow accounts
router.get("/escrow", getAllEscrowAccounts);

// Resolve dispute
router.post("/resolve-dispute", resolveDispute);

// Get system statistics
router.get("/stats", getSystemStats);

export default router;