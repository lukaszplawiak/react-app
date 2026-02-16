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
    echo 'cd /app/backend && node server.js &' >> /app/start.sh && \
    echo 'nginx -g "daemon off;"' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 80

CMD ["/app/start.sh"]