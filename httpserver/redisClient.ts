import Redis from "ioredis";

export const redisPublisher = new Redis();
export const redisSubscriber = new Redis(); // for trade → candle
export const redisWsSubscriber = new Redis(); // for WebSocket forwarding
