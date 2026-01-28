echo "🚀 Начинаем деплой приложения..."

# 1. Остановить текущие контейнеры
echo "Останавливаем текущие контейнеры..."
docker-compose down

# 2. Собрать образы
echo "Собираем образы..."
docker-compose build --no-cache

# 3. Запустить контейнеры
echo "Запускаем контейнеры..."
docker-compose up -d

# 4. Проверить статус
echo "Проверяем статус контейнеров..."
sleep 15
docker-compose ps

echo "✅ Деплой завершен!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost/api/afisha"