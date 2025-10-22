import { Document, Types } from "mongoose";

export interface IMilestone {
  title: string;
  description: string;
  amount: number;
  status: "pending" | "completed";
}

export interface ITransaction extends Document {
  buyerId: Types.ObjectId;
  sellerId?: Types.ObjectId;
  category: "freelancing" | "goods" | "services";
  title: string;
  description: string;
  amount: number;
  escrowBalance: number;
  status: "pending" | "accepted" | "completed" | "disputed" | "refunded";
  milestones?: IMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IEscrowAccount extends Document {
  transactionId: Types.ObjectId;
  amount: number;
  status: "locked" | "released" | "refunded";
  releasedAt?: Date;
  createdAt: Date;
}