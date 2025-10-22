import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/database";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import adminRoutes from "./routes/adminRoutes";
import { requireAuth } from "./middleware/authMiddleware";

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173", // or your frontend URL
    credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Database connection
connectDB();

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/transactions", transactionRoutes);
app.use("/admin", adminRoutes);

// Protected route example
app.get("/profile", requireAuth, (req: any, res: any) => {
    if (req.user) {
        res.json({ message: `Welcome user ${req.user.userId}` });
    }
});

const PORT = process.env.PORT || 8000;

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global error handler:", err);
    res.status(500).json({
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔑 JWT_SECRET configured: ${process.env.JWT_SECRET ? "Yes" : "No"}`);
});