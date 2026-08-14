import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || "queuelet",
  host: process.env.DB_HOST || "127.0.0.1",
  database: process.env.DB_NAME || "queuelet",
  password: process.env.DB_PASSWORD || "queuelet123",
  port: Number(process.env.DB_PORT) || 5434,
});

pool.on("connect", () => {
  console.log("PostgreSQL connected successfully ✅");
});

pool.on("error", (err) => {
  console.error("PostgreSQL connection error:", err);
});

export default pool;
