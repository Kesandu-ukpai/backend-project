import express from "express";
import {
  createTransaction,
  getTransactionDetails,
  acceptTransaction,
  releaseFunds,
  getAllPendingTransactions,
} from "../controllers/transactionController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

// All transaction routes require authentication
router.use(requireAuth);

// Get all pending transactions (marketplace)
router.get("/", getAllPendingTransactions);

// Create new transaction
router.post("/", createTransaction);

// Get transaction details
router.get("/:id", getTransactionDetails);

// Accept transaction (seller)
router.post("/:id/accept", acceptTransaction);

// Release funds (buyer)
router.post("/:id/release", releaseFunds);

export default router;