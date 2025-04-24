#!/bin/bash

# Вывести текущую директорию для отладки
echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la

# Удалить node_modules если существует
echo "Removing old node_modules if exists..."
rm -rf node_modules
rm -f package-lock.json

# Принудительная установка пакетов
echo "Installing dependencies..."
npm install express cors axios body-parser --no-optional

# Проверить установку express
echo "Checking if express was installed:"
ls -la node_modules/express

echo "Build completed successfully!"
