import { WebSocketServer } from "ws";

import Redis from "ioredis";

export const redisPublisher = new Redis();
export const redisSubscriber = new Redis(); // for trade → candle
export const redisWsSubscriber = new Redis(); // for WebSocket forwarding

redisSubscriber.subscribe("trades", (err, count) => {
  if (err) {
    console.error(" Failed to subscribe:", err);
  } else {
    console.log(`✅ Subscribed to ${count} channel(s).`);
  }
});

// Listen for published messages
redisSubscriber.on("message", (channel, message) => {
  // console.log("Got message from", channel, ":", message);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
});

const wss = new WebSocketServer({ port: 8080 });
const subscribedUser: any = [];

wss.on("connection", (ws) => {
  console.log("📡 Client connected");
});

// wss.on("message", (message) => {
//   console.log("Received:", message);
//   wss.clients.forEach((client) => {

//       client.send(message);

//   })

// });

// redisWsSubscriber.on("message", (channel, message) => {
//   wss.clients.forEach((client) => {
//     if (client.readyState === 1) {
//       if (channel === "trades") {
//         subscribedUser.push(client);
//         subscribedUser.forEach((client: any ) => {
//           if (client.readyState === client.OPEN) {
//             client.send(
//               JSON.stringify({ type: "TRADE", data: JSON.parse(message) })
//             );
//           }
//         })
//       }
//       if (channel === "orders") {
//         client.send(
//           JSON.stringify({ type: "ORDER", data: JSON.parse(message) })
//         );
//       }
//       if (channel.startsWith("candles:")) {
//         client.send(
//           JSON.stringify({
//             type: "CANDLE",
//             tf: channel.split(":")[1], // 1m, 5m, 15m, etc.
//             data: JSON.parse(message),
//           })
//         );
//       }
//     }
//   });
// });
