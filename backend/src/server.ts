import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import pool from "./config/database";
import jobRoutes from "./routes/jobRoutes";
import campaignRoutes from "./routes/campaignRoutes";
import userRoutes from "./routes/userRoutes";

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/jobs", jobRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "Queuelet API is running 🚀"
  });
});

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Queuelet API running on http://localhost:${PORT}`);
});

pool.query("SELECT NOW()")
  .then(() => {
    console.log("Database connection successful ✅");
  })
  .catch((err) => {
    console.error("Database connection failed ❌", err.message);
  });
