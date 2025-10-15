import mongoose, { Schema, Model } from "mongoose";
import { Iuser } from "../types/userType";

const UserSchema: Schema<Iuser> = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
    },
    role: {
        type: String,
        enum: ["buyer", "seller", "admin"],
        default: "buyer",
    },
    walletBalance: {
        type: Number,
        default: 0.0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

export const User: Model<Iuser> =
    mongoose.models.User || mongoose.model<Iuser>("User", UserSchema);