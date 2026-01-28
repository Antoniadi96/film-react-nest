# Стадия сборки фронтенда
FROM node:22-alpine AS frontend-builder
WORKDIR /app

# Копируем package.json из фронтенда
COPY frontend/package*.json ./
RUN npm ci --omit=optional
RUN npm install @rollup/rollup-linux-x64-musl --save-optional

# Устанавливаем переменные окружения для сборки фронтенда
ENV VITE_API_URL=/api/afisha
ENV VITE_CDN_URL=/content/afisha

# Копируем остальные файлы фронтенда
COPY frontend/ ./
RUN npm run build

# Стадия запуска nginx
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
# Копируем nginx.conf из папки nginx
COPY nginx/nginx.conf /etc/nginx/conf.d/

# Копируем собранный фронтенд из стадии builder
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]