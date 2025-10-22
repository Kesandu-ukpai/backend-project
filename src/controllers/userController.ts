import { Request, Response } from "express";
import { User } from "../models/user";
import { Transaction } from "../models/transaction";

export const getProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const getUserTransactions = async (req: any, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find({
      $or: [{ buyerId: req.user.userId }, { sellerId: req.user.userId }],
    })
      .populate("buyerId", "name email")
      .populate("sellerId", "name email")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

export const withdraw = async (req: any, res: Response): Promise<void> => {
  try {
    const { amount, method } = req.body; // method: 'nexiton' or 'bank'
    const userId = req.user.userId;

    // Validate amount
    if (!amount || amount <= 0) {
      res.status(400).json({ error: "Invalid amount" });
      return;
    }

    // Get current balance
    const user = await User.findById(userId);

    if (!user || user.walletBalance < amount) {
      res.status(400).json({ error: "Insufficient balance" });
      return;
    }

    // Calculate fee (bank has 2% fee, nexiton is free)
    const fee = method === "bank" ? amount * 0.02 : 0;
    const finalAmount = amount - fee;

    // Update balance
    user.walletBalance -= amount;
    await user.save();

    res.json({
      message: "Withdrawal successful",
      amount: finalAmount,
      fee,
      method,
      newBalance: user.walletBalance,
    });
  } catch (error) {
    res.status(500).json({ error: "Withdrawal failed" });
  }
};