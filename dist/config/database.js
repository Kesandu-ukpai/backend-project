"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose = require("mongoose");
const connectDB = async () => {
    try {
        console.log("MONGO_URI:", process.env.MONGODB);
        await mongoose.connect(process.env.MONGODB);
        console.log("connection successful");
    }
    catch {
        console.log("connection unsuccessful");
    }
};
exports.connectDB = connectDB;
