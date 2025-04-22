const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Главный маршрут для обработки запросов к Claude API
app.post('/claude', async (req, res) => {
  try {
    const { apiKey, payload } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API ключ не предоставлен' });
    }
    
    if (!payload) {
      return res.status(400).json({ error: 'Данные запроса не предоставлены' });
    }
    
    // Отправка запроса к API Claude
    const response = await axios.post('https://api.anthropic.com/v1/messages', payload, {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    });
    
    // Отправка ответа клиенту
    res.json(response.data);
  } catch (error) {
    console.error('Ошибка при запросе к API Claude:', error.response?.data || error.message);
    
    // Отправка сообщения об ошибке клиенту
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || 'Произошла ошибка при запросе к API'
    });
  }
});

// Проверка доступности сервера
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});