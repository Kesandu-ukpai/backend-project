import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user";
import { generateToken } from "../config/jwt";
import { IUser } from "../types/userType";

export const register = async (
    req: Request<{}, {}, IUser>,
    res: Response
): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

        // Validate input
        if (!name || !email || !password) {
            res.status(400).json({ message: "Please provide name, email, and password" });
            return;
        }

        console.log("Registration attempt for:", email);

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "Email already exists" });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "buyer",
        });

        console.log("User created successfully:", user._id);

        // Generate token
        const token = generateToken(String(user._id), user.email, user.role);



        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error: any) {
        console.error("Registration error:", error);
        res.status(500).json({
            message: "Server error during registration",
            error: error.message || "Unknown error"
        });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }

        // Generate token
        const token = generateToken(String(user._id), user.email, user.role);

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                walletBalance: user.walletBalance,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during login", error });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie("token");
    res.json({ message: "Logout successful" });
};