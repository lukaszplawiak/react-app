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

server.use(morgan(':method :url :status :response-time ms'));

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  secure: process.env.NODE_ENV === 'production',
};

const AUTH_COOKIE_NAME = 'authToken';

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

const requireAuth = (req, res, next) => {
  const db = router.db;
  const token = req.cookies[AUTH_COOKIE_NAME];

  if (!token) {
    console.warn(`[AUTH] No token — ${req.method} ${req.url} — IP: ${req.ip}`);
    return res
      .status(401)
      .json({ successful: false, errors: ['No session cookie provided'] });
  }

  const user = db.get('users').find({ token }).value();

  if (!user) {
    console.warn(`[AUTH] Invalid token — ${req.method} ${req.url} — IP: ${req.ip}`);
    return res
      .status(401)
      .json({ successful: false, errors: ['Invalid or expired session'] });
  }

  req.user = user;
  next();
};

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

// --- Auth endpoints ---

server.post('/login', authRateLimiter, (req, res) => {
  const { email, password } = req.body;
  const db = router.db;

  const user = db.get('users').find({ email, password }).value();

  if (user) {
    console.info(`[AUTH] Login success — ${email} — IP: ${req.ip}`);
    res.cookie(AUTH_COOKIE_NAME, user.token, COOKIE_OPTIONS);
    res.json({
      successful: true,
      result: user.token,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } else {
    console.warn(`[AUTH] Login failed — ${email} — IP: ${req.ip}`);
    res.status(401).json({ successful: false, errors: ['Invalid credentials'] });
  }
});

server.post('/register', authRateLimiter, (req, res) => {
  const { name, email, password } = req.body;
  const db = router.db;

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
    user: { name: newUser.name, email: newUser.email, role: newUser.role },
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
      result: { name: user.name, email: user.email, role: user.role },
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

server.post('/courses/add', requireAuth, requireAdmin, (req, res) => {
  const newCourse = {
    ...req.body,
    id: String(Date.now()),
    creationDate: new Date().toISOString(),
  };
  router.db.get('courses').push(newCourse).write();
  console.info(`[COURSES] Created — "${newCourse.title}" — by ${req.user.email}`);
  res.json({ successful: true, result: newCourse });
});

server.delete('/courses/:id', requireAuth, requireAdmin, (req, res) => {
  router.db.get('courses').remove({ id: req.params.id }).write();
  console.info(`[COURSES] Deleted — id: ${req.params.id} — by ${req.user.email}`);
  res.json({ successful: true });
});

server.put('/courses/:id', requireAuth, requireAdmin, (req, res) => {
  const course = router.db
    .get('courses')
    .find({ id: req.params.id })
    .assign(req.body)
    .write();
  console.info(`[COURSES] Updated — id: ${req.params.id} — by ${req.user.email}`);
  res.json({ successful: true, result: course });
});

// --- Authors endpoints ---

server.get('/authors/all', (req, res) => {
  const authors = router.db.get('authors').value();
  res.json({ successful: true, result: authors });
});

server.post('/authors/add', requireAuth, requireAdmin, (req, res) => {
  const newAuthor = { ...req.body, id: String(Date.now()) };
  router.db.get('authors').push(newAuthor).write();
  console.info(`[AUTHORS] Created — "${newAuthor.name}" — by ${req.user.email}`);
  res.json({ successful: true, result: newAuthor });
});

// --- Enrollments endpoints ---

server.post('/enrollments', requireAuth, (req, res) => {
  const db = router.db;
  const { courseId } = req.body;
  const userEmail = req.user.email;

  if (!courseId) {
    return res
      .status(400)
      .json({ successful: false, errors: ['courseId is required'] });
  }

  const course = db.get('courses').find({ id: courseId }).value();
  if (!course) {
    return res
      .status(404)
      .json({ successful: false, errors: ['Course not found'] });
  }

  const existing = db.get('enrollments').find({ userEmail, courseId }).value();
  if (existing) {
    return res
      .status(409)
      .json({ successful: false, errors: ['Already enrolled in this course'] });
  }

  const newEnrollment = {
    id: String(Date.now()),
    userEmail,
    courseId,
    enrolledAt: new Date().toISOString(),
  };

  db.get('enrollments').push(newEnrollment).write();
  console.info(`[ENROLLMENTS] ${userEmail} enrolled in course ${courseId}`);

  res.json({ successful: true, result: newEnrollment });
});

/**
 * GET /enrollments — admin gets all enrollments with course and user details
 */
server.get('/enrollments', requireAuth, requireAdmin, (req, res) => {
  const db = router.db;
  const enrollments = db.get('enrollments').value();
  const courses = db.get('courses').value();

  const result = enrollments.map((enrollment) => ({
    ...enrollment,
    courseName: courses.find((c) => c.id === enrollment.courseId)?.title ?? 'Unknown',
  }));

  res.json({ successful: true, result });
});

server.use(router);

const PORT = process.env.BACKEND_PORT || 4000;
server.listen(PORT, () => {
  console.info(`[SERVER] Mock API running on http://localhost:${PORT}`);
  console.info('[SERVER] Test credentials:');
  console.info('[SERVER] Admin: admin@test.com / admin123');
  console.info('[SERVER] User:  user@test.com / user123');
});