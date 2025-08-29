// seed-db.ts
import { Client } from "pg";

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "password",
  port: 5432,
});

const markets = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];

const intervals = [
  { name: "15s", bucket: "15 seconds" },
  { name: "30s", bucket: "30 seconds" },
  { name: "1m", bucket: "1 minute" },
  { name: "5m", bucket: "5 minutes" },
  { name: "15m", bucket: "15 minutes" },
  { name: "30m", bucket: "30 minutes" },
  { name: "1h", bucket: "1 hour" },
  { name: "1d", bucket: "1 day" },
  { name: "1w", bucket: "1 week" },
];

async function initializeMarket(market: string) {
  const tableName = market.toLowerCase();

  // Drop views + table
  for (const { name } of intervals) {
    await client.query(
      `DROP MATERIALIZED VIEW IF EXISTS ${tableName}_klines_${name} CASCADE;`
    );
  }
  await client.query(`DROP TABLE IF EXISTS ${tableName} CASCADE;`);

  // Create table
  await client.query(`
    CREATE TABLE ${tableName} (
      time        TIMESTAMPTZ NOT NULL,
      price       DOUBLE PRECISION,
      volume      DOUBLE PRECISION,
      stock_code  VARCHAR(10)
    );
  `);

  await client.query(`SELECT create_hypertable('${tableName}', 'time');`);

  // Insert fake trade data (last 30 minutes)
  const now = new Date();
  for (let i = 0; i < 60; i++) {
    const t = new Date(now.getTime() - i * 30 * 1000); // every 30 sec
    const price = 100 + Math.random() * 10; // random price
    const volume = Math.random() * 5;
    await client.query(
      `INSERT INTO ${tableName} (time, price, volume, stock_code)
       VALUES ($1, $2, $3, $4)`,
      [t, price, volume, market]
    );
  }

  // Create materialized views
  for (const { name, bucket } of intervals) {
    await client.query(`
      CREATE MATERIALIZED VIEW ${tableName}_klines_${name} AS
      SELECT
        time_bucket('${bucket}', time) AS bucket,
        first(price, time) AS open,
        max(price) AS high,
        min(price) AS low,
        last(price, time) AS close,
        sum(volume) AS volume,
        stock_code
      FROM ${tableName}
      GROUP BY bucket, stock_code;
    `);
  }

  console.log(`✅ ${market} initialized & seeded`);
}

async function main() {
  await client.connect();
  for (const market of markets) {
    await initializeMarket(market);
  }
  await client.end();
  console.log("🎉 All markets seeded successfully!");
}

main().catch((err) => {
  console.error("❌ Error during seeding:", err);
  client.end();
});
