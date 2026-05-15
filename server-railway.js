const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const morgan = require('morgan');
const jsonServer = require('json-server');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const router = jsonServer.router('db.json');
const db = router.db;

app.use(express.json());
app.use(cookieParser());

// --- Request logging ---

/**
 * Morgan logs every request: method, URL, status, response time.
 * In production this output goes to Railway's log stream —
 * visible in the Railway dashboard and exportable to log aggregators.
 *
 * Production note: for structured logging use 'winston' or 'pino'
 * with JSON output format for easier parsing by log aggregators
 * (Datadog, Papertrail, CloudWatch).
 */
app.use(morgan(':method :url :status :response-time ms'));

// --- Config ---

const AUTH_COOKIE_NAME = 'authToken';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  secure: process.env.NODE_ENV === 'production',
};

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

// --- Auth middleware ---

/**
 * Verifies that the request carries a valid session cookie.
 * Logs unauthorized access attempts for security monitoring.
 */
const requireAuth = (req, res, next) => {
  const token = req.cookies[AUTH_COOKIE_NAME];

  if (!token) {
    console.warn(
      `[AUTH] No token — ${req.method} ${req.url} — IP: ${req.ip}`
    );
    return res
      .status(401)
      .json({ successful: false, errors: ['No session cookie provided'] });
  }

  const user = db.get('users').find({ token }).value();

  if (!user) {
    console.warn(
      `[AUTH] Invalid token — ${req.method} ${req.url} — IP: ${req.ip}`
    );
    return res
      .status(401)
      .json({ successful: false, errors: ['Invalid or expired session'] });
  }

  req.user = user;
  next();
};

/**
 * Verifies that the authenticated user has the admin role.
 * Logs privilege escalation attempts.
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    console.warn(
      `[AUTHZ] Forbidden — user ${req.user?.email} attempted ${req.method} ${req.url} — IP: ${req.ip}`
    );
    return res
      .status(403)
      .json({ successful: false, errors: ['Admin access required'] });
  }
  next();
};

// --- User endpoints ---

app.post('/api/login', authRateLimiter, (req, res) => {
  const { email, password } = req.body;

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

app.post('/api/register', authRateLimiter, (req, res) => {
  const { name, email, password } = req.body;

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
  console.info(
    `[AUTH] Logout — ${req.user?.email ?? 'unknown'} — IP: ${req.ip}`
  );
  res.clearCookie(AUTH_COOKIE_NAME);
  res.json({ successful: true });
});

// --- Courses endpoints ---

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
  console.info(
    `[COURSES] Created — "${newCourse.title}" — by ${req.user.email}`
  );
  res.json({ successful: true, result: newCourse });
});

app.delete('/api/courses/:id', requireAuth, requireAdmin, (req, res) => {
  db.get('courses').remove({ id: req.params.id }).write();
  console.info(
    `[COURSES] Deleted — id: ${req.params.id} — by ${req.user.email}`
  );
  res.json({ successful: true });
});

app.put('/api/courses/:id', requireAuth, requireAdmin, (req, res) => {
  const course = db
    .get('courses')
    .find({ id: req.params.id })
    .assign(req.body)
    .write();
  console.info(
    `[COURSES] Updated — id: ${req.params.id} — by ${req.user.email}`
  );
  res.json({ successful: true, result: course });
});

// --- Authors endpoints ---

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
  console.info(
    `[AUTHORS] Created — "${newAuthor.name}" — by ${req.user.email}`
  );
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
  console.info(`[SERVER] Running on port ${PORT}`);
});