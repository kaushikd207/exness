// wsServer.ts
import { WebSocketServer } from "ws";
import { redisWsSubscriber } from "./redisClient";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("📡 Client connected");
});

// Subscribe to everything
  // redisWsSubscriber.subscribe("trades");
["trades", "orders", "candles:1m", "candles:5m", "candles:15m", "candles:30m", "candles:1h"].forEach((ch) =>
  redisWsSubscriber.subscribe(ch)
);

redisWsSubscriber.on("message", (channel, message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      if (channel === "trades") {
        client.send(JSON.stringify({ type: "TRADE", data: JSON.parse(message) }));
      }
      if (channel === "orders") {
        client.send(JSON.stringify({ type: "ORDER", data: JSON.parse(message) }));
      }
      if (channel.startsWith("candles:")) {
        client.send(
          JSON.stringify({
            type: "CANDLE",
            tf: channel.split(":")[1], // 1m, 5m, 15m, etc.
            data: JSON.parse(message),
          })
        );
      }
    }
  });
});
