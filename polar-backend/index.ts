import WebSocket from "ws";
import { redisPublisher, queuePublisher } from "./redisClient";
const wsUrl = "wss://stream.binance.com:9443/ws/btcusdt@trade";

export interface tradeDataType {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  t: number; // Trade ID
  p: number; // Price
  q: string; // Quantity
  T: number; // Trade time
  m: boolean; // Is buyer the market maker?
  M: boolean; // Ignore
}

const ws = new WebSocket(wsUrl);

ws.on("open", () => {
  console.log("✅ WebSocket connection opened");
});

ws.on("message", async (data) => {
  const parsed = JSON.parse(data.toString());
  const trade: tradeDataType = parsed.data ?? parsed;

  const tradeMessage = {
    symbol: trade.s,
    price: parseFloat(trade.p),
    quantity: parseFloat(trade.q),
    isMaker: trade.m,
    time: trade.T,
  };
  redisPublisher.publish("trades", JSON.stringify(tradeMessage));
  queuePublisher.rpush("tradeQueue", JSON.stringify(tradeMessage));
});

ws.on("close", () => {
  console.log("WebSocket connection closed");
});

ws.on("error", (err) => {
  console.error("WebSocket error:", err);
});
