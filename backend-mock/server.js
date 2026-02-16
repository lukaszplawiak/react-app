const jsonServer = require('json-server');

const server = jsonServer.create();

const router = jsonServer.router('db.json');

const middlewares = jsonServer.defaults();

// KONFIGURACJA SERWERA

server.use(middlewares);

server.use(jsonServer.bodyParser);

// CUSTOM ENDPOINTS (Mock Authentication)

server.post('/login', (req, res) => {
  const { email, password } = req.body;

  const db = router.db;

  const user = db.get('users').find({ email, password }).value();

  if (user) {
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

server.get('/users/me', (req, res) => {
  const db = router.db;
  const token = req.headers.authorization || req.get('Authorization');

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
  res.json({ successful: true });
});

// COURSES ENDPOINTS

server.get('/courses/all', (req, res) => {
  const courses = router.db.get('courses').value();

  res.json({
    successful: true,
    result: courses,
  });
});

server.post('/courses/add', (req, res) => {
  const newCourse = {
    ...req.body,
    id: String(Date.now()),
    creationDate: new Date().toISOString(),
  };

  router.db.get('courses').push(newCourse).write();

  res.json({
    successful: true,
    result: newCourse,
  });
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

  res.json({
    successful: true,
    result: course,
  });
});

// AUTHORS ENDPOINTS

server.get('/authors/all', (req, res) => {
  const authors = router.db.get('authors').value();
  res.json({
    successful: true,
    result: authors,
  });
});

server.post('/authors/add', (req, res) => {
  const newAuthor = {
    ...req.body,
    id: String(Date.now()),
  };

  router.db.get('authors').push(newAuthor).write();

  res.json({
    successful: true,
    result: newAuthor,
  });
});

// LOGI URUCHOMIENIA SERWERA

server.use(router);

const PORT = process.env.BACKEND_PORT || 3001;
server.listen(PORT, () => {
  console.log('🚀 Mock API Server running on http://localhost:${PORT}');
  console.log('📚 Courses: http://localhost:${PORT}/courses/all');
  console.log('👥 Authors: http://localhost:${PORT}/authors/all');
  console.log('\nTest credentials:');
  console.log('Admin: admin@test.com / admin123');
  console.log('User:  user@test.com / user123');
});
