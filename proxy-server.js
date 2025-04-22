// proxy-server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const API_URL = "https://api.anthropic.com/v1/messages";
const API_KEY = "sk-ant-api03-..."; // ВСТАВЬ СВОЙ API КЛЮЧ СЮДА

app.post("/claude", async (req, res) => {
    const { apiKey, payload } = req.body;
    if (!apiKey) {
        return res.status(400).json({ error: "Missing API key" });
  }
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy failed to contact Claude." });
  }
});

app.listen(5001, () => {
  console.log("🚀 Claude proxy listening on http://localhost:5001");
});
