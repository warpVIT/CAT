// proxy-server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const API_URL = "https://api.anthropic.com/v1/messages";

// Используем переменную окружения PORT или PORT_PROXY, или порт 5001 по умолчанию
const port = process.env.PORT_PROXY || process.env.PORT || 5001;

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

// Добавляем простую страницу по умолчанному пути
app.get("/", (req, res) => {
    res.send("Claude proxy server is running. Use /claude endpoint for API requests.");
});

app.listen(port, () => {
    console.log(`🚀 Claude proxy listening on http://localhost:${port}`);
});
