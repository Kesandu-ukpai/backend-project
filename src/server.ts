import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from 'express'
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/database";
import authRoutes from "./routes/authRoutes";
import { requireAuth } from "./middleware/authMiddleware";

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Database connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);


app.get("/api/profile", requireAuth, (req, res) => {
    // The user payload from the JWT is available on req.user
    if (req.user) {
        res.json({ message: `Welcome user ${req.user.id}` });
    }
});

app.listen(8000, () => console.log("Server running on http://localhost:8000"));
