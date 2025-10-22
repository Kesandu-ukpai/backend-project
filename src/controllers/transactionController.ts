import { Request, Response } from "express";
import mongoose from "mongoose";
import { Transaction } from "../models/transaction";
import { User } from "../models/user";
import { EscrowAccount } from "../models/escrow";

export const createTransaction = async (req: any, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { category, title, description, amount, milestones } = req.body;
    const buyerId = req.user.userId;

    // Check buyer balance
    const buyer = await User.findById(buyerId).session(session);

    if (!buyer || buyer.walletBalance < amount) {
      await session.abortTransaction();
      res.status(400).json({ error: "Insufficient balance" });
      return;
    }

    // Create transaction
    const transaction = await Transaction.create(
      [
        {
          buyerId,
          category,
          title,
          description,
          amount,
          escrowBalance: amount,
          milestones: category === "freelancing" ? milestones : undefined,
        },
      ],
      { session }
    );

    // Lock funds in escrow
    await EscrowAccount.create(
      [
        {
          transactionId: transaction[0]._id,
          amount,
        },
      ],
      { session }
    );

    // Deduct from buyer wallet
    buyer.walletBalance -= amount;
    await buyer.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      message: "Transaction created successfully",
      transaction: transaction[0],
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: "Failed to create transaction" });
  } finally {
    session.endSession();
  }
};

export const getTransactionDetails = async (req: any, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("buyerId", "name email")
      .populate("sellerId", "name email");

    if (!transaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
};

export const acceptTransaction = async (req: any, res: Response): Promise<void> => {
  try {
    const transactionId = req.params.id;
    const sellerId = req.user.userId;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, status: "pending", sellerId: { $exists: false } },
      { sellerId, status: "accepted" },
      { new: true }
    );

    if (!transaction) {
      res.status(400).json({ error: "Cannot accept this transaction" });
      return;
    }

    res.json({ message: "Transaction accepted successfully", transaction });
  } catch (error) {
    res.status(500).json({ error: "Failed to accept transaction" });
  }
};

export const releaseFunds = async (req: any, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transactionId = req.params.id;
    const buyerId = req.user.userId;

    // Get transaction
    const transaction = await Transaction.findOne({
      _id: transactionId,
      buyerId,
    }).session(session);

    if (!transaction || !transaction.sellerId) {
      await session.abortTransaction();
      res.status(400).json({ error: "Cannot release funds for this transaction" });
      return;
    }

    // Release escrow funds to seller
    const seller = await User.findById(transaction.sellerId).session(session);
    if (seller) {
      seller.walletBalance += transaction.escrowBalance;
      await seller.save({ session });
    }

    // Update transaction
    transaction.status = "completed";
    transaction.escrowBalance = 0;
    await transaction.save({ session });

    // Update escrow account
    await EscrowAccount.findOneAndUpdate(
      { transactionId },
      { status: "released", releasedAt: new Date() },
      { session }
    );

    await session.commitTransaction();

    res.json({ message: "Funds released successfully" });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: "Failed to release funds" });
  } finally {
    session.endSession();
  }
};

export const getAllPendingTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const transactions = await Transaction.find({
      status: "pending",
      sellerId: { $exists: false },
    })
      .populate("buyerId", "name email")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};