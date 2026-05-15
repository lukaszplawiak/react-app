const jsonServer = require('json-server');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(cookieParser());

// --- Request logging ---

server.use(morgan(':method :url :status :response-time ms'));

// --- Config ---

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  secure: process.env.NODE_ENV === 'production',
};

const AUTH_COOKIE_NAME = 'authToken';

// --- Rate limiting ---

/**
 * Limits auth endpoints to 10 requests per 15 minutes per IP.
 * Production note: use Redis store (rate-limit-redis) for persistence
 * across restarts and horizontal scaling.
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    successful: false,
    errors: ['Too many requests — please try again in 15 minutes'],
  },
});

// --- Auth endpoints ---

server.post('/login', authRateLimiter, (req, res) => {
  const { email, password } = req.body;
  const db = router.db;

  /*
   * MOCK ONLY — passwords stored and compared in plaintext.
   * Production implementation:
   *   const user = db.get('users').find({ email }).value();
   *   const valid = await bcrypt.compare(password, user.passwordHash);
   */
  const user = db.get('users').find({ email, password }).value();

  if (user) {
    console.info(`[AUTH] Login success — ${email} — IP: ${req.ip}`);
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
    console.warn(`[AUTH] Login failed — ${email} — IP: ${req.ip}`);
    res.status(401).json({
      successful: false,
      errors: ['Invalid credentials'],
    });
  }
});

server.post('/register', authRateLimiter, (req, res) => {
  const { name, email, password } = req.body;
  const db = router.db;

  /*
   * MOCK ONLY — password stored in plaintext.
   * Production implementation:
   *   const passwordHash = await bcrypt.hash(password, 12);
   *   store passwordHash instead of password
   */
  const newUser = {
    id: String(Date.now()),
    name,
    email,
    password,
    role: 'user',
    token: crypto.randomBytes(32).toString('hex'),
  };

  db.get('users').push(newUser).write();
  console.info(`[AUTH] Registration success — ${email} — IP: ${req.ip}`);

  res.json({
    successful: true,
    user: {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

server.get('/users/me', (req, res) => {
  const db = router.db;
  const token = req.cookies[AUTH_COOKIE_NAME];

  if (!token) {
    console.warn(`[AUTH] No token — GET /users/me — IP: ${req.ip}`);
    res.status(401).json({ successful: false, errors: ['No token provided'] });
    return;
  }

  const user = db.get('users').find({ token }).value();

  if (user) {
    res.json({
      successful: true,
      result: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } else {
    console.warn(`[AUTH] Invalid token — GET /users/me — IP: ${req.ip}`);
    res.status(401).json({ successful: false, errors: ['Invalid token'] });
  }
});

server.delete('/logout', (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.json({ successful: true });
});

// --- Courses endpoints ---

server.get('/courses/all', (req, res) => {
  const courses = router.db.get('courses').value();
  res.json({ successful: true, result: courses });
});

server.post('/courses/add', (req, res) => {
  const newCourse = {
    ...req.body,
    id: String(Date.now()),
    creationDate: new Date().toISOString(),
  };
  router.db.get('courses').push(newCourse).write();
  res.json({ successful: true, result: newCourse });
});

server.delete('/courses/:id', (req, res) => {
  router.db.get('courses').remove({ id: req.params.id }).write();
  res.json({ successful: true });
});

server.put('/courses/:id', (req, res) => {
  const course = router.db
    .get('courses')
    .find({ id: req.params.id })
    .assign(req.body)
    .write();
  res.json({ successful: true, result: course });
});

// --- Authors endpoints ---

server.get('/authors/all', (req, res) => {
  const authors = router.db.get('authors').value();
  res.json({ successful: true, result: authors });
});

server.post('/authors/add', (req, res) => {
  const newAuthor = {
    ...req.body,
    id: String(Date.now()),
  };
  router.db.get('authors').push(newAuthor).write();
  res.json({ successful: true, result: newAuthor });
});

server.use(router);

const PORT = process.env.BACKEND_PORT || 4000;
server.listen(PORT, () => {
  console.info(`[SERVER] Mock API running on http://localhost:${PORT}`);
  console.info('[SERVER] Test credentials:');
  console.info('[SERVER] Admin: admin@test.com / admin123');
  console.info('[SERVER] User:  user@test.com / user123');
});