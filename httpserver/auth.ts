import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { pg } from "./db";
import { Request, Response, NextFunction } from "express";

const SECRET = "supersecret";

export async function signup(req: Request, res: Response) {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  try {
    const result = await pg.query(
      "INSERT INTO users (email, password) VALUES ($1,$2) RETURNING id,email,balance",
      [email, hashed]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function signin(req: Request, res: Response) {
  const { email, password } = req.body;
  const result = await pg.query("SELECT * FROM users WHERE email=$1", [email]);
  if (result.rows.length === 0)
    return res.status(401).json({ error: "Invalid" });

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid" });

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {
    expiresIn: "1d",
  });
  res.json({ token, balance: user.balance });
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers["authorization"];
  if (!header) return res.sendStatus(401);

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch {
    return res.sendStatus(403);
  }
}
