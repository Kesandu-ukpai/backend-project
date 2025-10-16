import mongoose, { Model, Schema} from "mongoose"
import { Itransaction } from "../types/transactionType"

const TransactionSchema: Schema<Itransaction> = new Schema({
    buyerId: {
        type: String,
        required: true, 
    },
    sellerId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "completed", "cancelled"],
        default: "pending"
    },
    description: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Transaction: Model<Itransaction> =
    mongoose.models.Transaction || mongoose.model<Itransaction>("Transaction", TransactionSchema);