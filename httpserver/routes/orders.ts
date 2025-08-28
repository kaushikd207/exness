import { Router } from "express";
import { pg } from "../db";
import { authMiddleware } from "../auth";

const router = Router();

router.post("/place", authMiddleware, async (req, res) => {
  const { symbol, side, price, quantity } = req.body;
  const user = (req as any).user;

  const total = price * quantity;

  // check balance for BUY
  const result = await pg.query("SELECT balance FROM users WHERE id=$1", [
    user.id,
  ]);
  const balance = result.rows[0].balance;

  if (side === "BUY" && balance < total) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  // transaction: insert order + update balance
  try {
    await pg.query("BEGIN");

    await pg.query(
      "INSERT INTO orders (user_id, symbol, side, price, quantity) VALUES ($1,$2,$3,$4,$5)",
      [user.id, symbol, side, price, quantity]
    );

    if (side === "BUY") {
      await pg.query("UPDATE users SET balance = balance - $1 WHERE id=$2", [
        total,
        user.id,
      ]);
    } else if (side === "SELL") {
      await pg.query("UPDATE users SET balance = balance + $1 WHERE id=$2", [
        total,
        user.id,
      ]);
    }

    await pg.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await pg.query("ROLLBACK");
    res.status(500).json({ error: "Order failed" });
  }
});

router.get("/my", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const result = await pg.query("SELECT * FROM orders WHERE user_id=$1", [
    user.id,
  ]);
  res.json(result.rows);
});

export default router;
