import IORedis from "ioredis";

const redisConnection = new IORedis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("Redis connected successfully ✅");
});

redisConnection.on("error", (err) => {
  console.error("Redis connection error ❌", err.message);
});

export default redisConnection;