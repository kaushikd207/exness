// routes/market.ts
import { Router } from "express";
import { pg } from "../db";

const router = Router();

// map friendly intervals to time_bucket text
const validIntervals: Record<string, string> = {
  "15s": "15 seconds",
  "30s": "30 seconds",
  "1m": "1 minute",
  "5m": "5 minutes",
  "15m": "15 minutes",
  "30m": "30 minutes",
  "1h": "1 hour",
  "1d": "1 day",
  "1w": "1 week",
};

// candidate timestamp-like column names (order = priority)
const timeColumnCandidates = [
  "created_at",
  "time",
  "timestamp",
  "trade_time",
  "ts",
];

/**
 * Find which time column exists in 'orders' table (or another table name).
 */
async function detectTimeColumn(tableName = "orders"): Promise<string | null> {
  // use information_schema to check column names (safe)
  const res = await pg.query(
    `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = $1
      AND column_name = ANY($2)
    ORDER BY array_position($2, column_name) ASC
    LIMIT 1;
    `,
    [tableName, timeColumnCandidates]
  );

  if (res.rows.length === 0) return null;
  return res.rows[0].column_name;
}

/**
 * GET /market/candles/:symbol/:interval
 */
router.get("/candles/:symbol/:interval", async (req, res) => {
  const { symbol, interval } = req.params;
  const bucket = validIntervals[interval];

  if (!bucket) {
    return res.status(400).json({ error: "Invalid interval" });
  }

  // detect existing time column on the orders table
  let timeCol: string | null;
  try {
    timeCol = await detectTimeColumn("orders");
  } catch (err: any) {
    console.error("Failed to detect time column:", err?.message ?? err);
    return res.status(500).json({ error: "Failed to inspect DB schema" });
  }

  if (!timeCol) {
    return res.status(500).json({
      error:
        "No timestamp column found in 'orders'. Expected one of: " +
        timeColumnCandidates.join(", ") +
        ". Run `SELECT column_name FROM information_schema.columns WHERE table_name='orders';` to inspect columns.",
    });
  }

  // safe to interpolate timeCol because we selected it from known whitelist
  const query = `
    SELECT
      time_bucket($1, ${timeCol}) AS bucket,
      first(price, ${timeCol}) AS open,
      max(price) AS high,
      min(price) AS low,
      last(price, ${timeCol}) AS close,
      sum(quantity) AS volume
    FROM orders
    WHERE lower(symbol) = lower($2)
    GROUP BY bucket
    ORDER BY bucket DESC
    LIMIT 100;
  `;

  try {
    const result = await pg.query(query, [bucket, symbol]);
    return res.json(result.rows);
  } catch (err: any) {
    console.error("❌ Query error:", err.message ?? err);
    return res.status(500).json({ error: "Database error" });
  }
});

export default router;
