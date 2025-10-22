import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "buyer" | "seller" | "admin";
  walletBalance: number;
  createdAt: Date;
  updatedAt: Date;
}