import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET as string;

export const generatedToken = (userId: string) => {
    return jwt.sign({userId}, JWT_SECRET, {expiresIn: "2h"})
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET);

}