const express = require('express');
const jsonServer = require('json-server');
const path = require('path');

const app = express();
const router = jsonServer.router('db.json');
const db = router.db;

app.use(express.json());

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.get('users').find({ email, password }).value();
  if (user) {
    res.json({ successful: true, result: user.token, user: { name: user.name, email: user.email, role: user.role } });
  } else {
    res.status(401).json({ successful: false, errors: ['Invalid credentials'] });
  }
});

// Register
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  const newUser = { id: String(Date.now()), name, email, password, role: 'user', token: 'token-' + Date.now() };
  db.get('users').push(newUser).write();
  res.json({ successful: true, user: { name, email, role: 'user' } });
});

// Users/me
app.get('/api/users/me', (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ successful: false, errors: ['No token'] });
  const user = db.get('users').find({ token }).value();
  if (user) {
    res.json({ successful: true, result: { name: user.name, email: user.email, role: user.role } });
  } else {
    res.status(401).json({ successful: false, errors: ['Invalid token'] });
  }
});

// Logout
app.delete('/api/logout', (req, res) => { res.json({ successful: true }); });

// Courses endpoints
app.get('/api/courses/all', (req, res) => {
  const courses = db.get('courses').value();
  res.json({ successful: true, result: courses });
});

app.post('/api/courses/add', (req, res) => {
  const newCourse = { ...req.body, id: String(Date.now()), creationDate: new Date().toISOString() };
  db.get('courses').push(newCourse).write();
  res.json({ successful: true, result: newCourse });
});

app.delete('/api/courses/:id', (req, res) => {
  db.get('courses').remove({ id: req.params.id }).write();
  res.json({ successful: true });
});

app.put('/api/courses/:id', (req, res) => {
  const course = db.get('courses').find({ id: req.params.id }).assign(req.body).write();
  res.json({ successful: true, result: course });
});

// Authors endpoints
app.get('/api/authors/all', (req, res) => {
  const authors = db.get('authors').value();
  res.json({ successful: true, result: authors });
});

app.post('/api/authors/add', (req, res) => {
  const newAuthor = { ...req.body, id: String(Date.now()) };
  db.get('authors').push(newAuthor).write();
  res.json({ successful: true, result: newAuthor });
});

// Serve React build
app.use(express.static(path.join(__dirname, 'build')));

// React Router fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => { console.log('Server on port ' + PORT); });