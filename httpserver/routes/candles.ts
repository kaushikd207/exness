import { Router } from "express";
import { Client } from "pg";

const router = Router();

// PostgreSQL client
const pg = new Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "password",
  port: 5432,
});
pg.connect();

/** Normalize ts like "5m", " 1H ", "15s" -> "5 minutes" etc. */
function normalizeBucket(ts: unknown): string | null {
  if (ts == null) return null;

  // Handle arrays & weird types safely
  const raw = Array.isArray(ts) ? ts[0] : String(ts);
  const trimmed = raw.trim().toLowerCase(); // <-- fixes "5m " / "5M"

  // Accept formats like 15s / 30s / 1m / 5m / 1h / 1d / 1w
  const m = trimmed.match(/^(\d+)(s|m|h|d|w)$/);
  if (!m) return null;

  const n = parseInt(m[1], 10);
  const unit = m[2]; // s|m|h|d|w
  const unitMap: Record<string, { singular: string; plural: string }> = {
    s: { singular: "second", plural: "seconds" },
    m: { singular: "minute", plural: "minutes" },
    h: { singular: "hour", plural: "hours" },
    d: { singular: "day", plural: "days" },
    w: { singular: "week", plural: "weeks" },
  };

  const u = unitMap[unit];
  if (!u) return null;

  return n === 1 ? `1 ${u.singular}` : `${n} ${u.plural}`;
}

/** Map query asset -> actual table created by seed-db (btcusdt, ethusdt, solusdt) */
function resolveTableName(asset: unknown): string | null {
  if (asset == null) return null;
  const raw = Array.isArray(asset) ? asset[0] : String(asset);
  const a = raw.trim().toLowerCase();

  const tableMap: Record<string, string> = {
    // common aliases -> table names
    btc: "btcusdt",
    btcusdt: "btcusdt",
    eth: "ethusdt",
    ethusdt: "ethusdt",
    sol: "solusdt",
    solusdt: "solusdt",
  };

  return tableMap[a] ?? null;
}

/** Parse timestamp (ms). If not provided, default to last 24h. */
function parseRange(
  startTime: unknown,
  endTime: unknown
): { start: Date; end: Date } {
  const now = Date.now();

  const toMs = (v: unknown): number | null => {
    if (v == null) return null;
    const s = Array.isArray(v) ? v[0] : String(v);
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  const startMs = toMs(startTime) ?? now - 24 * 60 * 60 * 1000;
  const endMs = toMs(endTime) ?? now;

  return { start: new Date(startMs), end: new Date(endMs) };
}

router.get("/", async (req, res) => {
  const { asset, startTime, endTime, ts } = req.query;

  // Debug (helps catch arrays/whitespace)
  // console.log("raw ts:", JSON.stringify(ts), "raw asset:", JSON.stringify(asset));

  const bucket = normalizeBucket(ts);
  if (!bucket) {
    return res
      .status(400)
      .json({
        error:
          "Invalid interval. Use one of e.g. 15s,30s,1m,5m,15m,30m,1h,1d,1w",
      });
  }

  const table = resolveTableName(asset);
  if (!table) {
    return res
      .status(400)
      .json({
        error: "Invalid asset. Try BTC, ETH, SOL, BTCUSDT, ETHUSDT, SOLUSDT",
      });
  }

  const { start, end } = parseRange(startTime, endTime);

  try {
    // Query from the base trade table (seeded as hypertable)
    const query = `
      SELECT
        time_bucket($1, time) AS bucket,
        first(price, time)    AS open,
        max(price)            AS high,
        min(price)            AS low,
        last(price, time)     AS close,
        sum(volume)           AS volume
      FROM ${table}
      WHERE time >= $2 AND time <= $3
      GROUP BY bucket
      ORDER BY bucket ASC;
    `;

    const result = await pg.query(query, [bucket, start, end]);

    const candles = result.rows.map((r) => ({
      timestamp: new Date(r.bucket).getTime(),
      open: Number(r.open),
      close: Number(r.close),
      high: Number(r.high),
      low: Number(r.low),
      volume: Number(r.volume),
      decimal: 4,
    }));

    res.json({ candles });
  } catch (err: any) {
    console.error("❌ Candle query error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
