import WebSocket from "ws";
import { writeApi, Point } from "./db";
import { getRecentTrades } from "./queryTrades";
import { redisPublisher } from "./redisClient";
const wsUrl = "wss://stream.binance.com:9443/ws/btcusdt@trade";

interface tradeDataType {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  t: number; // Trade ID
  p: string; // Price
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

  const point = new Point("trades")
    .tag("symbol", trade.s) // e.g. BTCUSDT
    .floatField("price", parseFloat(trade.p))
    .floatField("quantity", parseFloat(trade.q))
    .booleanField("isMaker", trade.m)
    .timestamp(trade.T * 1e6)
    .booleanField("marketMaker", trade.m);

  writeApi.writePoint(point);
  await writeApi.flush();
  // console.log("📊 Trade written:", trade.s, trade.p, trade.q);

  const tradeMessage = {
    symbol: trade.s,
    price: parseFloat(trade.p),
    quantity: parseFloat(trade.q),
    isMaker: trade.m,
    time: trade.T,
  };

  redisPublisher.publish("trades", JSON.stringify(tradeMessage));
});

(async () => {
  const trades = await getRecentTrades(30);
  console.log("Recent Trades:", trades);
})();

ws.on("close", () => {
  console.log("WebSocket connection closed");
  writeApi.close().then(() => console.log("InfluxDB write API closed"));
});

ws.on("error", (err) => {
  console.error("WebSocket error:", err);
});
