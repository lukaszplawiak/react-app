FROM node:18-alpine

WORKDIR /app

COPY backend-mock/package*.json ./
RUN npm ci --only=production --silent
RUN npm install express --save

COPY backend-mock/ ./

WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts --silent
COPY . ./
ENV REACT_APP_API_URL=/api
RUN npm run build

WORKDIR /app
COPY <<'SERVERJS' server.js
const express = require('express');
const jsonServer = require('json-server');
const path = require('path');

const app = express();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

app.use(middlewares);
app.use(express.json());

const db = router.db;

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.get('users').find({ email, password }).value();
  if (user) {
    res.json({
      successful: true,
      result: user.token,
      user: { name: user.name, email: user.email, role: user.role }
    });
  } else {
    res.status(401).json({ successful: false, errors: ['Invalid credentials'] });
  }
});

// Register endpoint
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  const newUser = {
    id: String(Date.now()),
    name, email, password, role: 'user',
    token: 'token-' + Date.now()
  };
  db.get('users').push(newUser).write();
  res.json({ successful: true, user: { name, email, role: 'user' } });
});

// All API routes
app.use('/api', router);

// Serve React build
app.use(express.static(path.join(__dirname, 'build')));

// React Router fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🚀 Server running on port ' + PORT);
  console.log('📚 API: http://localhost:' + PORT + '/api');
});
SERVERJS

EXPOSE ${PORT:-3000}

CMD ["node", "server.js"]