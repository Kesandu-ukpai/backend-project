import { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/user";
import { Transaction } from "../models/transaction";
import { EscrowAccount } from "../models/escrow";

export const addFunds = async (req: any, res: Response): Promise<void> => {
  try {
    const { userId, amount } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: "Invalid amount" });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: amount } },
      { new: true }
    ).select("-password");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      message: "Funds added successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add funds" });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getAllEscrowAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    const escrowAccounts = await EscrowAccount.find()
      .populate({
        path: "transactionId",
        populate: [
          { path: "buyerId", select: "name email" },
          { path: "sellerId", select: "name email" },
        ],
      })
      .sort({ createdAt: -1 });

    res.json(escrowAccounts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch escrow accounts" });
  }
};

export const resolveDispute = async (req: any, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { transactionId, action } = req.body; // action: 'release' or 'refund'

    if (!["release", "refund"].includes(action)) {
      await session.abortTransaction();
      res.status(400).json({ error: "Invalid action" });
      return;
    }

    // Get transaction
    const transaction = await Transaction.findById(transactionId).session(session);

    if (!transaction) {
      await session.abortTransaction();
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    if (action === "release" && transaction.sellerId) {
      // Release to seller
      await User.findByIdAndUpdate(
        transaction.sellerId,
        { $inc: { walletBalance: transaction.escrowBalance } },
        { session }
      );
    } else if (action === "refund") {
      // Refund to buyer
      await User.findByIdAndUpdate(
        transaction.buyerId,
        { $inc: { walletBalance: transaction.escrowBalance } },
        { session }
      );
    }

    // Update transaction
    transaction.status = action === "release" ? "completed" : "refunded";
    transaction.escrowBalance = 0;
    await transaction.save({ session });

    // Update escrow
    await EscrowAccount.findOneAndUpdate(
      { transactionId },
      {
        status: action === "release" ? "released" : "refunded",
        releasedAt: new Date(),
      },
      { session }
    );

    await session.commitTransaction();

    res.json({ message: `Dispute resolved: ${action}` });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: "Failed to resolve dispute" });
  } finally {
    session.endSession();
  }
};

export const getSystemStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const pendingTransactions = await Transaction.countDocuments({ status: "pending" });
    const completedTransactions = await Transaction.countDocuments({
      status: "completed",
    });

    const totalEscrowAmount = await EscrowAccount.aggregate([
      { $match: { status: "locked" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      totalUsers,
      totalTransactions,
      pendingTransactions,
      completedTransactions,
      totalEscrowAmount: totalEscrowAmount[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch system stats" });
  }
};