import jwt from "jsonwebtoken";
import { type Request, type Response, type NextFunction } from "express";

export const JWT_SECRET = "kaushik";

export function generateToken(user: { id: string; email: string }) {
  return jwt.sign(user, JWT_SECRET);
}

export function authMiddleware(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({
      message: "Unauthorized",
    });

  try {
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
}
