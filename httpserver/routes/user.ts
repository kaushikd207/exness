import { Router } from "express";
import { users } from "../data";
import { v4 as uuidv4 } from "uuid";
import { generateToken, authMiddleware } from "../auth";

const router = Router();

router.post("/signup", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(403).json({
      message: "Error while signing up",
    });

  const exists = users.find((u) => u.email === email);
  if (exists) return res.status(403).json({ message: "User already exists" });
  const userId = uuidv4();

  users.push({ id: userId, email, password, usd_balance: 1000000 });

  res.json({ userId });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(403).json({ message: "Incorrect credentials" });
  const token = generateToken({ id: user.id, email: user.email });
  res.json({ token });
});

router.get("/balance", authMiddleware, (req: any, res) => {
  const user = users.find((u) => u.id === req.user.id);
  res.json({ usd_balance: user?.usd_balance });
});

export default router;
