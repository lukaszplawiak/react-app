const jsonServer = require('json-server');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(cookieParser());

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  secure: process.env.NODE_ENV === 'production',
};

const AUTH_COOKIE_NAME = 'authToken';

server.post('/login', (req, res) => {
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

server.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  const db = router.db;

  /*
   * MOCK ONLY — password stored in plaintext.
   * Production implementation:
   *   const passwordHash = await bcrypt.hash(password, 12);
   *   store passwordHash instead of password
   *
   * MOCK ONLY — token is a predictable timestamp string.
   * Production implementation:
   *   const token = crypto.randomBytes(32).toString('hex');
   *   or: jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' })
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
    res.status(401).json({ successful: false, errors: ['Invalid token'] });
  }
});

server.delete('/logout', (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.json({ successful: true });
});

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
  console.log(`Mock API Server running on http://localhost:${PORT}`);
  console.log('\nTest credentials:');
  console.log('Admin: admin@test.com / admin123');
  console.log('User:  user@test.com / user123');
});