import { Response, Request } from "express"
import { Transaction } from "../models/transaction"
import { Itransaction } from "../types/transactionType"

export const createTrans = async (req: Request<{}, {}, Itransaction>, res: Response): Promise<void> => {
    try {
        const { buyerId, sellerId, amount, status, description, } = req.body
        const transaction = await Transaction.create({
            buyerId, sellerId, amount, status, description,
        })
        res.status(201).json({message: "Transaction created successfully", transaction});
    }
    catch (err) {
        console.error(err);
        res.json({message: "Transaction unsuccessful, try again later"});
    }
}

export const findAlltransact = async(req: Request , res: Response) => {
    try{
        const transactions = Transaction.find();
        res.json(transactions);
    }
    catch(err){
        console.error(err);
        res.json({message: "Failed"})
    }
}