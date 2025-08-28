import { Client } from "pg";

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "password",
  port: 5432,
});

async function seed() {
  try {
    await client.connect();
    console.log("🌱 Seeding database...");

    // 1. Create tables if not exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        balance DOUBLE PRECISION DEFAULT 500
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        symbol VARCHAR(20) NOT NULL,
        side VARCHAR(4) NOT NULL CHECK (side IN ('BUY','SELL')),
        price DOUBLE PRECISION NOT NULL,
        quantity DOUBLE PRECISION NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Insert demo users
    await client.query(`
      INSERT INTO users (email, password, balance)
      VALUES 
        ('alice@example.com', 'hashedpassword1', 500),
        ('bob@example.com', 'hashedpassword2', 500)
      ON CONFLICT (email) DO NOTHING;
    `);

    // 3. Insert demo orders
    await client.query(`
      INSERT INTO orders (user_id, symbol, side, price, quantity)
      VALUES
        (1, 'BTCUSDT', 'BUY', 50000, 0.01),
        (2, 'ETHUSDT', 'SELL', 3000, 0.5);
    `);

    console.log("✅ Database seeded successfully!");
  } catch (err) {
    console.error("❌ Error during seeding:", err);
  } finally {
    await client.end();
  }
}

seed();
