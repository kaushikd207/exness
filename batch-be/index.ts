import { Client } from "pg";
import Redis from "ioredis";

// 1. Configure PostgreSQL connection
const pg = new Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "password",
  port: 5432,
});
pg.connect();

// 2. Define the message shape actually stored in Redis
export interface TradeMessage {
  symbol: string; // e.g. BTCUSDT
  price: number; // parsed float
  quantity: number; // parsed float
  isMaker: boolean; // true/false
  time: number; // trade timestamp in ms
}

// 3. Extract only relevant fields for DB
const extractReleventData = (trade: TradeMessage) => {
  const price = trade.price;
  const timestamp = new Date(trade.time);
  const volume = trade.quantity;
  return { timestamp, price, volume };
};

// 4. Batch Insert Helper
async function insertBatch(
  table: string,
  rows: { timestamp: Date; price: number; volume: number }[]
) {
  if (rows.length === 0) return;

  const placeholders: string[] = [];
  const values: any[] = [];

  rows.forEach((row, i) => {
    const idx = i * 3; // 3 fields per row
    placeholders.push(`($${idx + 1}, $${idx + 2}, $${idx + 3})`);
    values.push(row.timestamp, row.price, row.volume);
  });

  const query = `
    INSERT INTO ${table} (time, price, volume)
    VALUES ${placeholders.join(",")}
  `;

  await pg.query(query, values);
  console.log(`✅ Inserted ${rows.length} rows into ${table}`);
}

// 5. Main loop
async function main() {
  const redis = new Redis(); // ioredis client

  // Hold batches for each symbol dynamically
  const batches: Record<string, any[]> = {};

  while (true) {
    try {
      // brpop with ioredis
      const response = await redis.brpop("tradeQueue", 0);
      if (!response) continue;

      const [, element] = response; // response = [queueName, element]

      const trade: TradeMessage = JSON.parse(element);
      const data = extractReleventData(trade);

      console.log("📥 Received trade:", trade.symbol, data);

      // Ensure batch array exists for this symbol
      if (!batches[trade.symbol]) {
        batches[trade.symbol] = [];
      }

      // Push into the correct batch
      batches[trade.symbol].push(data);

      // If batch >= 100 → flush to DB
      if (batches[trade.symbol].length >= 100) {
        await insertBatch(trade.symbol, batches[trade.symbol]);
        batches[trade.symbol] = [];
      }
    } catch (err) {
      console.error("❌ Error processing trade:", err);
    }
  }
}

main();
