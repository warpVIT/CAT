const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Логирование для отладки
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Проверка работоспособности
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Сервер работает',
    timestamp: new Date().toISOString()
  });
});

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
    console.log('Отправка запроса к API Claude...');
    
    try {
      const response = await axios.post('https://api.anthropic.com/v1/messages', payload, {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      });
      
      // Отправка ответа клиенту
      res.json(response.data);
    } catch (apiError) {
      console.error('Ошибка API Claude:', apiError.message);
      console.error('Детали:', apiError.response?.data || 'Нет дополнительных данных');
      
      res.status(apiError.response?.status || 500).json({
        error: apiError.response?.data?.error?.message || 'Ошибка при запросе к API Claude',
        details: apiError.message
      });
    }
  } catch (error) {
    console.error('Общая ошибка обработки:', error.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера', details: error.message });
  }
});

// Обработка статических файлов, если они есть
if (fs.existsSync(path.join(__dirname, 'dist'))) {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Обработка всех остальных маршрутов для SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Если нет статических файлов, просто отправляем текстовое сообщение
  app.get('/', (req, res) => {
    res.send('API сервер для интеграции с Claude. Используйте /claude для запросов.');
  });
}

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
  console.log(`Для проверки работоспособности: http://localhost:${port}/health`);
});
