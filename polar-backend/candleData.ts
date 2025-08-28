import { redisSubscriber, redisPublisher } from "./redisClient";

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  startTime: number;
  endTime: number;
}

let currentCandle: Candle | null = null;
const interval = 60 * 1000;

redisSubscriber.subscribe("trades");

redisSubscriber.on("message", (channel, message) => {
  if (channel !== "trades") return;

  const trade = JSON.parse(message);
  const price = trade.price;
  const time = trade.time;

  const candleStart = Math.floor(time / interval) * interval;
  const candleEnd = candleStart + interval;

  if (!currentCandle) {
    currentCandle = {
      open: price,
      high: price,
      low: price,
      close: price,
      volume: trade.quantity,
      startTime: candleStart,
      endTime: candleEnd,
    };
  } else if (time < currentCandle.endTime) {
    currentCandle.high = Math.max(currentCandle.high, price);
    currentCandle.low = Math.min(currentCandle.low, price);
    currentCandle.close = price;
    currentCandle.volume += trade.quantity;
  }
});

setInterval(() => {
  const now = Date.now();
  if (currentCandle && now >= currentCandle.endTime) {
    redisPublisher.publish("candles", JSON.stringify(currentCandle));
    console.log("🕯️ Published Candle:", currentCandle);

    currentCandle = {
      open: currentCandle.close,
      high: currentCandle.close,
      low: currentCandle.close,
      close: currentCandle.close,
      volume: 0,
      startTime: currentCandle.endTime,
      endTime: currentCandle.endTime + interval,
    };
  }
}, 1000);
