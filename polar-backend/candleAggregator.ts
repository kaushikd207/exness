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

const intervals = {
  "5m": 5 * 60 * 1000,
  "15m": 15 * 60 * 1000,
  "30m": 30 * 60 * 1000,
  "1h": 60 * 60 * 1000,
};

const currentCandles: Record<string, Candle | null> = {
  "5m": null,
  "15m": null,
  "30m": null,
  "1h": null,
};

redisSubscriber.subscribe("candles:1m");

redisSubscriber.on("message", (channel, message) => {
  if (channel !== "candles:1m") return;

  const oneMinuteCandle: Candle = JSON.parse(message);

  for (const [tf, interval] of Object.entries(intervals)) {
    const candleStart =
      Math.floor(oneMinuteCandle.startTime / interval) * interval;
    const candleEnd = candleStart + interval;

    let candle = currentCandles[tf];

    if (!candle) {
      currentCandles[tf] = {
        open: oneMinuteCandle.open,
        high: oneMinuteCandle.high,
        low: oneMinuteCandle.low,
        close: oneMinuteCandle.close,
        volume: oneMinuteCandle.volume,
        startTime: candleStart,
        endTime: candleEnd,
      };
    } else {
      if (oneMinuteCandle.startTime < candle.endTime) {
        candle.high = Math.max(candle.high, oneMinuteCandle.high);
        candle.low = Math.min(candle.low, oneMinuteCandle.low);
        candle.close = oneMinuteCandle.close;
        candle.volume += oneMinuteCandle.volume;
      } else {
        redisPublisher.publish(`candles:${tf}`, JSON.stringify(candle));

        currentCandles[tf] = {
          open: oneMinuteCandle.open,
          high: oneMinuteCandle.high,
          low: oneMinuteCandle.low,
          close: oneMinuteCandle.close,
          volume: oneMinuteCandle.volume,
          startTime: candleStart,
          endTime: candleEnd,
        };
      }
    }
  }
});
