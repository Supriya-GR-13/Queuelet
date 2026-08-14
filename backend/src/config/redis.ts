import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("Redis connected successfully ✅");
});

redisConnection.on("error", (err) => {
  console.error("Redis connection error ❌", err.message);
});

export default redisConnection;
