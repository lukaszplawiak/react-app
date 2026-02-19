FROM node:18-alpine

WORKDIR /app

COPY backend-mock/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production --silent

WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts --silent
COPY . ./
ENV REACT_APP_API_URL=/api
RUN npm run build

WORKDIR /app
RUN npm init -y
RUN npm install express json-server --save

COPY backend-mock/db.json ./db.json
COPY server-railway.js ./server.js

EXPOSE 3000

CMD ["node", "server.js"]