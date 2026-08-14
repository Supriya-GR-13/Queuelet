import axios from "axios";

// Configure with VITE_API_URL in a .env file to point at a non-local backend.
// Defaults to the Queuelet backend running locally on port 5000.
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
