import { redisSubscriber } from "./redisClient";

redisSubscriber.subscribe("trades", (err, count) => {
  if (err) {
    console.error(" Failed to subscribe:", err);
  } else {
    console.log(`Subscribed to ${count} channel(s).`);
  }
});