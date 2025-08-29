import { Router } from "express";
import { pg } from "../db";

const router = Router();

// ✅ Allowed intervals mapped to PostgreSQL `time_bucket`
const validIntervals: Record<string, string> = {
  "1m": "1 minute",
  "5m": "5 minutes",
  "15m": "15 minutes",
  "30m": "30 minutes",
  "1h": "1 hour",
};

router.get("/candles/:symbol/:interval", async (req, res) => {
  const { symbol, interval } = req.params;

  const bucket = validIntervals[interval];
  if (!bucket) {
    return res.status(400).json({ error: "Invalid interval" });
  }

  try {
    const result = await pg.query(
      `
      SELECT
        time_bucket($1, created_at) AS bucket,
        first(price, created_at) AS open,
        max(price) AS high,
        min(price) AS low,
        last(price, created_at) AS close,
        sum(quantity) AS volume
      FROM orders
      WHERE LOWER(symbol) = LOWER($2)
      GROUP BY bucket
      ORDER BY bucket DESC
      LIMIT 100;
      `,
      [bucket, symbol]
    );

    res.json(result.rows);
  } catch (err: any) {
    console.error("❌ Query error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
