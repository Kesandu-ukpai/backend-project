import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user";
import { generatedToken } from "../config/jwt";

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({ message: "User registered successfully", userId: user._id });
    } catch (error) {
        res.status(500).json({ message: "Server error during registration", error });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generatedToken(user.id);

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    });

    res.json({ message: "Login successful" });
};
