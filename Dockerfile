FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts --silent

COPY . ./

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY backend-mock/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production --silent

WORKDIR /app
RUN npm init -y
RUN npm install express json-server cookie-parser --save

COPY backend-mock/db.seed.json ./db.seed.json
COPY backend-mock/scripts/init-db.js ./init-db.js
COPY server-railway.js ./server.js
COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["sh", "-c", "node init-db.js && node server.js"]