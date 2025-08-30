import { Router } from "express";
import { trades, users } from "../data";
import { authMiddleware } from "../auth";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.post("/", authMiddleware, (req: any, res) => {
  const { type, margin, leverage } = req.body;
  if (!["buy", "sell"].includes(type) || !margin || !leverage) {
    return res.status(403).json({ message: "Incorrect inputs" });
  }
  const user = users.find((u) => u.id === req.user.id)!;

  if (user?.usd_balance < margin) {
    return res.status(400).json({ message: "Insufficient balance" });
  }

  const orderId = uuidv4();
  trades.push({
    orderId,
    userId: user.id,
    type,
    margin,
    leverage,
    openPrice: 1000000000,
    status: "open",
  });
  res.json({ orderId });
});

router.get("/open", authMiddleware, (req, res) => {
  const openTrades = trades.filter(
    (t) => t.userId === req.user.id && t.status === "open"
  );
  res.json({ trades: openTrades });
});

router.get("/", authMiddleware, (req: any, res) => {
  const closedTrades = trades.filter(
    (t) => t.userId === req.user.id && t.status === "closed"
  );
  res.json({ trades: closedTrades });
});

export default router;
