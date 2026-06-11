import { createClient } from "redis";
import config from "../config.ts";
import logger from "../log/logger.ts";

const redisClient = createClient({
  url: config.redis.url,
});

redisClient.on("connect", () => {
  logger.info("Redis connected");
});

redisClient.on("ready", () => {
  logger.info("Redis ready");
});

redisClient.on("reconnecting", () => {
  logger.warn("Redis reconnecting...");
});

redisClient.on("error", (err) => {
  logger.error(`Redis error: ${err.message}`);
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export default redisClient;