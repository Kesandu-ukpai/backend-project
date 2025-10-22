import mongoose, { Schema, Model } from "mongoose";
import { ITransaction, IMilestone } from "../types/transactionType";

const MilestoneSchema = new Schema<IMilestone>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
});

const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: String,
      enum: ["freelancing", "goods", "services"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    escrowBalance: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "disputed", "refunded"],
      default: "pending",
    },
    milestones: [MilestoneSchema],
  },
  {
    timestamps: true,
  }
);

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);