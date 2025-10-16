import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from 'express'
import cookieParser from "cookie-parser";
import cors from "cors";
import { TokenPayload } from "./types/user.id";
import { connectDB } from "./config/database";
import authRoutes from "./routes/authRoutes";
import { requireAuth } from "./middleware/authMiddleware";
import {Request, Response} from 'express'
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Database connection
connectDB();

// Routes
app.use("/auth", authRoutes);


app.get("/profile", requireAuth, (req:Request, res:Response) => {
    
    if (req.user) {
        res.json({ message: `Welcome user ${req.user.id}` });
    }
});

app.listen(8000, () => console.log("Server running on http://localhost:8000"));
