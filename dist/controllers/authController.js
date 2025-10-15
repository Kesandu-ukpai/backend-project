"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = require("../models/user");
const jwt_1 = require("../config/jwt");
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const user = await user_1.User.create({
            name,
            email,
            password: hashedPassword,
        });
        res.status(201).json({ message: "User registered successfully", userId: user._id });
    }
    catch (error) {
        res.status(500).json({ message: "Server error during registration", error });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await user_1.User.findOne({ email });
    if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = (0, jwt_1.generatedToken)(user.id);
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    });
    res.json({ message: "Login successful" });
};
exports.login = login;
