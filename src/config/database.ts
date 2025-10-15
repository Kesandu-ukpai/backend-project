const mongoose = require("mongoose")

export const connectDB = async():Promise<void> => {
    try{
        console.log("MONGO:", process.env.MONGODB);
        await mongoose.connect(process.env.MONGODB);
        console.log("connection successful")
    }
    catch{
        console.log("connection unsuccessful")
    }
}