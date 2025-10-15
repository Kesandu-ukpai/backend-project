const mongoose = require("mongoose")

export const connectDB = async():Promise<void> => {
    try{
        console.log("MONGO_URI:", process.env.MONGODB);
        await mongoose.connect(process.env.MONGODB);
        console.log("connection successful")
    }
    catch{
        console.log("connection unsuccessful")
    }
}