"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "./.env" });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./config/database");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({ origin: "http://localhost:5173", credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Database connection
(0, database_1.connectDB)();
// Routes
app.use("/api/auth", authRoutes_1.default);
// Example protected route
app.get("/api/profile", authMiddleware_1.requireAuth, (req, res) => {
    // The user payload from the JWT is available on req.user
    if (req.user) {
        res.json({ message: `Welcome user ${req.user.id}` });
    }
});
app.listen(8000, () => console.log("Server running on http://localhost:8000"));
