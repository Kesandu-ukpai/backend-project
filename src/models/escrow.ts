import mongoose, { Schema, Model } from "mongoose";
import { IEscrowAccount } from "../types/transactionType";

const EscrowAccountSchema: Schema<IEscrowAccount> = new Schema(
  {
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["locked", "released", "refunded"],
      default: "locked",
    },
    releasedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const EscrowAccount: Model<IEscrowAccount> =
  mongoose.models.EscrowAccount ||
  mongoose.model<IEscrowAccount>("EscrowAccount", EscrowAccountSchema);