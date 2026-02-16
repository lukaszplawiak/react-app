FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache nginx

COPY backend-mock/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production --silent
COPY backend-mock/ ./

WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . ./
ENV REACT_APP_API_URL=/api
RUN npm run build

COPY nginx.render.conf /etc/nginx/http.d/default.conf
RUN mkdir -p /run/nginx

RUN mkdir -p /usr/share/nginx/html
RUN cp -r /app/build/* /usr/share/nginx/html/

RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Start backend in background' >> /app/start.sh && \
    echo 'cd /app/backend' >> /app/start.sh && \
    echo 'node server.js &' >> /app/start.sh && \
    echo 'BACKEND_PID=$!' >> /app/start.sh && \
    echo 'echo "Backend started with PID $BACKEND_PID"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Wait for backend to be ready' >> /app/start.sh && \
    echo 'sleep 3' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Use Railway PORT or default to 80' >> /app/start.sh && \
    echo 'PORT=${PORT:-80}' >> /app/start.sh && \
    echo 'echo "Starting nginx on port $PORT"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Update nginx config to use Railway PORT' >> /app/start.sh && \
    echo 'sed -i "s/listen 80;/listen $PORT;/" /etc/nginx/http.d/default.conf' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Start nginx in foreground' >> /app/start.sh && \
    echo 'exec nginx -g "daemon off;"' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE ${PORT:-80}

CMD ["/app/start.sh"]