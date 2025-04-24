const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5001;

// Расширенная конфигурация CORS
app.use(cors({
  origin: '*', // Разрешаем запросы с любого домена
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key', 'anthropic-version']
}));

// Увеличиваем лимит для больших запросов
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Логирование для отладки
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Проверим и обслужим статические файлы из разных возможных директорий
// Сначала проверяем dist (для сборок Vite/React)
if (fs.existsSync(path.join(__dirname, 'dist'))) {
  console.log('Serving static files from ./dist');
  app.use(express.static(path.join(__dirname, 'dist')));
} 
// Затем проверяем public (часто используется для статических файлов)
else if (fs.existsSync(path.join(__dirname, 'public'))) {
  console.log('Serving static files from ./public');
  app.use(express.static(path.join(__dirname, 'public')));
} 
// Проверяем, есть ли файлы в корневой директории
else if (fs.existsSync(path.join(__dirname, 'index.html'))) {
  console.log('Serving static files from root directory');
  app.use(express.static(__dirname));
}
// Также проверим папку src (на случай, если там тоже есть веб-страницы)
else if (fs.existsSync(path.join(__dirname, 'src'))) {
  console.log('Serving static files from ./src');
  app.use(express.static(path.join(__dirname, 'src')));
} else {
  console.log('No static files directory found');
}

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
    
    console.log('Получен запрос к Claude API');
    
    if (!apiKey) {
      console.log('Ошибка: API ключ не предоставлен');
      return res.status(400).json({ error: 'API ключ не предоставлен' });
    }
    
    if (!payload) {
      console.log('Ошибка: Данные запроса не предоставлены');
      return res.status(400).json({ error: 'Данные запроса не предоставлены' });
    }
    
    // Отправка запроса к API Claude
    console.log('Отправка запроса к API Claude...');
    
    try {
      // Используем URL API Claude без шаблонных выражений
      const claudeApiUrl = 'https://api.anthropic.com/v1/messages';
      
      const response = await axios.post(claudeApiUrl, payload, {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      });
      
      console.log('Получен ответ от Claude API');
      
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

// Обрабатываем запрос к корневому маршруту, чтобы проверить, работает ли сервер
app.get('/', (req, res, next) => {
  // Если есть index.html, используем его
  const indexHtmlPaths = [
    path.join(__dirname, 'dist', 'index.html'),
    path.join(__dirname, 'public', 'index.html'),
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src', 'index.html')
  ];
  
  for (const htmlPath of indexHtmlPaths) {
    if (fs.existsSync(htmlPath)) {
      return res.sendFile(htmlPath);
    }
  }
  
  // Если нет index.html, просто отправляем простое сообщение
  res.send('API сервер для интеграции с Claude. Используйте /claude для запросов.');
  // Не вызываем next(), чтобы завершить обработку запроса здесь
});

// Последний маршрут - для Single Page Applications, чтобы направлять все другие запросы на index.html
app.get('*', (req, res) => {
  // Исключаем запросы к API и файлам из обработки
  if (req.url.startsWith('/api/') || req.url.startsWith('/claude') || req.url.includes('.')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  // Выбираем первую доступную index.html из возможных локаций
  const possiblePaths = [
    path.join(__dirname, 'dist', 'index.html'),
    path.join(__dirname, 'public', 'index.html'),
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src', 'index.html')
  ];
  
  for (const htmlPath of possiblePaths) {
    if (fs.existsSync(htmlPath)) {
      return res.sendFile(htmlPath);
    }
  }
  
  // Если ни один файл не найден, отправляем простое сообщение
  res.send('API сервер для интеграции с Claude. Используйте /claude для запросов.');
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
  console.log(`Для проверки работоспособности: http://localhost:${port}/health`);
});
