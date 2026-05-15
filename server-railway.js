const express = require('express');
const cookieParser = require('cookie-parser');
const jsonServer = require('json-server');
const path = require('path');

const app = express();
const router = jsonServer.router('db.json');
const db = router.db;

app.use(express.json());
app.use(cookieParser());

const AUTH_COOKIE_NAME = 'authToken';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  secure: process.env.NODE_ENV === 'production',
};

// --- Auth middleware ---

/**
 * Verifies that the request carries a valid session cookie.
 * In production this would verify a signed JWT.
 * Here it looks up the token in db.json (mock only).
 */
const requireAuth = (req, res, next) => {
  const token = req.cookies[AUTH_COOKIE_NAME];

  if (!token) {
    return res
      .status(401)
      .json({ successful: false, errors: ['No session cookie provided'] });
  }

  const user = db.get('users').find({ token }).value();

  if (!user) {
    return res
      .status(401)
      .json({ successful: false, errors: ['Invalid or expired session'] });
  }

  req.user = user;
  next();
};

/**
 * Verifies that the authenticated user has the admin role.
 * Must be used after requireAuth.
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ successful: false, errors: ['Admin access required'] });
  }
  next();
};

// --- User endpoints ---

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.get('users').find({ email, password }).value();

  if (user) {
    res.cookie(AUTH_COOKIE_NAME, user.token, COOKIE_OPTIONS);

    res.json({
      successful: true,
      result: user.token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } else {
    res.status(401).json({
      successful: false,
      errors: ['Invalid credentials'],
    });
  }
});

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;

  const newUser = {
    id: String(Date.now()),
    name,
    email,
    password,
    role: 'user',
    token: `token-${Date.now()}`,
  };

  db.get('users').push(newUser).write();

  res.json({
    successful: true,
    user: {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

app.get('/api/users/me', requireAuth, (req, res) => {
  res.json({
    successful: true,
    result: {
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

app.delete('/api/logout', (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.json({ successful: true });
});

// --- Courses endpoints ---
// Public reads, admin-only writes

app.get('/api/courses/all', (req, res) => {
  const courses = db.get('courses').value();
  res.json({ successful: true, result: courses });
});

app.post('/api/courses/add', requireAuth, requireAdmin, (req, res) => {
  const newCourse = {
    ...req.body,
    id: String(Date.now()),
    creationDate: new Date().toISOString(),
  };
  db.get('courses').push(newCourse).write();
  res.json({ successful: true, result: newCourse });
});

app.delete('/api/courses/:id', requireAuth, requireAdmin, (req, res) => {
  db.get('courses').remove({ id: req.params.id }).write();
  res.json({ successful: true });
});

app.put('/api/courses/:id', requireAuth, requireAdmin, (req, res) => {
  const course = db
    .get('courses')
    .find({ id: req.params.id })
    .assign(req.body)
    .write();
  res.json({ successful: true, result: course });
});

// --- Authors endpoints ---
// Public reads, admin-only writes

app.get('/api/authors/all', (req, res) => {
  const authors = db.get('authors').value();
  res.json({ successful: true, result: authors });
});

app.post('/api/authors/add', requireAuth, requireAdmin, (req, res) => {
  const newAuthor = {
    ...req.body,
    id: String(Date.now()),
  };
  db.get('authors').push(newAuthor).write();
  res.json({ successful: true, result: newAuthor });
});

// --- Static files and React Router fallback ---

app.use(express.static(path.join(__dirname, 'build')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

// --- Start server ---

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});