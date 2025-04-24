import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5173; // Используем порт, который предоставляет Render
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Настраиваем CORS и парсинг JSON
app.use(cors());
app.use(express.json());

// Прокси-эндпоинт для Claude API
app.post("/claude", async (req, res) => {
  try {
    const { apiKey, payload } = req.body;
    
    console.log("Получен запрос к Claude API");
    
    if (!apiKey) {
      return res.status(400).json({ error: "Missing API key" });
    }
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    console.log("Статус ответа от Claude:", response.status);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Ошибка Claude API:", JSON.stringify(data));
    }
    
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Ошибка прокси:", err);
    res.status(500).json({ 
      error: "Proxy failed to contact Claude.",
      details: err.message 
    });
  }
});

// Тестовый эндпоинт
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

async function createVite() {
  // Создаем Vite сервер в middleware режиме
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  // Используем Vite как middleware
  app.use(vite.middlewares);

  // Для всех остальных запросов отдаем index.html
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      // Всегда возвращаем index.html для SPA роутинга
      let template = await vite.transformIndexHtml(url, 
        await fetch(path.resolve(__dirname, 'index.html')).then(r => r.text())
      );
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

// Запускаем всё
async function start() {
  if (process.env.NODE_ENV === 'production') {
    // В продакшне отдаем сбилденные файлы
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // В разработке используем Vite
    await createVite();
  }

  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
  });
}

start().catch(e => {
  console.error("Ошибка запуска сервера:", e);
});
