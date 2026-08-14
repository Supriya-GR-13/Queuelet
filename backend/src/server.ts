import express from "express";
import cors from "cors";
import pool from "./config/database";
import jobRoutes from "./routes/jobRoutes";
import campaignRoutes from "./routes/campaignRoutes";



const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/campaigns", campaignRoutes);
app.use("/api/jobs", jobRoutes);



app.get("/", (_req, res) => {
  res.json({
    message: "Queuelet API is running 🚀"
  });
});

const PORT = 5000;

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