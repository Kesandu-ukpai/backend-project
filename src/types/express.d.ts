import "express";

declare global {
  namespace Express {
    interface Request {
      user?: any; // or a proper interface if you know the shape
    }
  }
}
