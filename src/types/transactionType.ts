import { Document} from "mongoose"

export interface Itransaction extends Document {
    buyerId: string,
    sellerId: string,
    amount: number,
    status: "pending"| "completed" | "cancelled"
    description?: string,
    createdAt: Date,
}