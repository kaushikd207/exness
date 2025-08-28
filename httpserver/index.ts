import express from "express";
import { getRecentTrades } from "./queryTrades";
import { redisPublisher } from "./redisClient";

const app = express();
const PORT = 4000;

app.use(express.json());

app.get("/api/trades", async (req, res) => {
  try {
    const trades = await getRecentTrades(50);
    res.json(trades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch trades" });
  }
});

app.post("/api/order", (req, res) => {
  const { type, price, quantity } = req.body;

  if (!["CALL", "PUT"].includes(type)) {
    return res.status(400).json({ error: "Invalid order type" });
  }

  const order = {
    id: Date.now(),
    type,
    price,
    quantity,
    status: "PLACED",
    createdAt: new Date().toISOString(),
  };

  redisPublisher.publish("orders", JSON.stringify(order));

  console.log("Order placed:", order);
  res.json(order);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
