import { Pool } from "pg";

const pool = new Pool({
  user: "queuelet",
  host: "127.0.0.1",
  database: "queuelet",
  password: "queuelet123",
  port: 5434,
});

pool.on("connect", () => {
  console.log("PostgreSQL connected successfully ✅");
});

pool.on("error", (err) => {
  console.error("PostgreSQL connection error:", err);
});

export default pool;