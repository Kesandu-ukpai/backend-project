import mongoose from "mongoose";

const MONGODB:string|undefined = process.env.MONGODB;

export const connectDB = async (): Promise<void> => {
  try {
    if (!MONGODB) {
      throw new Error("MONGODB environment variable is not set");
    }
    await mongoose.connect(MONGODB);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err);
});