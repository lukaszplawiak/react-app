# Course Platform — Frontend

React Redux Toolkit React Router Axios Docker License

React 18 SPA for managing online courses — a portfolio project demonstrating modern frontend patterns: Redux Toolkit with async thunks, role-based access control, centralized API layer, and containerized deployment.

[Live Demo](https://react-app-production-d055.up.railway.app) — first load after inactivity may take 30–60 seconds (Railway free tier)

Overview | Architecture | Design Decisions | Tech Stack | Running Locally | Docker | Running Tests | Project Structure

---

## Overview

A course management dashboard where administrators create, update and delete courses and authors, while regular users browse and search the catalogue. Authentication is token-based with role-derived UI — admin-only controls are absent from the DOM for non-admin users, not merely hidden.

### What the frontend covers

- **Authentication** — login and registration with token persistence in localStorage, automatic session restore on page reload
- **Course management** — full CRUD for courses and authors, admin-only write operations enforced on both client and server
- **Search** — client-side title filter with `useMemo` to avoid redundant recomputation on every render
- **Loading states** — `status: idle | loading | succeeded | failed` in every Redux slice; buttons disabled and labels changed during in-flight requests to prevent duplicate submissions
- **Error surfaces** — all API errors propagated through `rejectWithValue` and rendered in the UI; no silent failures
- **Deployment** — multi-container Docker setup: React build served by Nginx, backend mock in a separate container on a private network

---

## Architecture

```
src/
├── common/
│   ├── Button/                # Reusable button — type, disabled, onClick props
│   └── Input/                 # Reusable input — error display, type, placeholder
│
├── components/
│   ├── CourseForm/            # Create and update form — shared component, mode from URL param
│   │   └── components/
│   │       └── AuthorItem/    # Add / remove author row
│   ├── CourseInfo/            # Detail view — reads store directly via useSelector
│   ├── Courses/               # List view — filter, loading state, admin controls
│   │   └── components/
│   │       ├── CourseCard/    # Single card — DELETE and UPDATE for admin only
│   │       ├── EmptyCourseList/
│   │       └── SearchBar/     # Controlled form, submits on Enter and button click
│   ├── Header/                # Logo, username, Login / Logout
│   ├── Login/                 # Credentials form — loginUser.fulfilled.match() pattern
│   ├── PrivateRoute/          # Wraps admin-only routes — role check, redirect with return URL
│   └── Registration/          # Registration form — registerUserService via services.js
│
├── helpers/
│   ├── formatCreationDate.js  # Date → DD.MM.YYYY
│   └── getCourseDuration.js   # Minutes → HH:MM hours
│
├── mocks/
│   └── mockedData.js          # Static fixture data for tests
│
├── store/
│   ├── user/
│   │   ├── reducer.js         # name, email, isAuth, role, status, error
│   │   └── thunk.js           # fetchUser, loginUser, logoutUser — LS_KEYS object
│   ├── courses/
│   │   ├── reducer.js         # courses[], status, error — all CRUD cases
│   │   └── thunk.js           # fetchCourses, createCourse, updateCourse, deleteCourse
│   ├── authors/
│   │   ├── reducer.js         # authors[], status, error
│   │   └── thunk.js           # fetchAuthors, createAuthor
│   └── index.js               # configureStore — single export
│
├── services.js                # All HTTP calls — axios, authHeaders() helper
├── constants.js               # Validation limits, UI labels, CSS class names
└── config.js                  # REACT_APP_API_URL with /api fallback
```

---

## Design Decisions

**Why Redux Toolkit instead of plain Redux?**
RTK eliminates the boilerplate of manually written action type strings, action creators, and switch-case reducers. `createAsyncThunk` generates `pending / fulfilled / rejected` action types automatically and integrates directly with `extraReducers` — the slice handles all three states without additional wiring. Migration from plain Redux would require changing only the store layer; components consume `useSelector` regardless.

**Why a single `services.js` instead of per-feature API files?**
All HTTP calls share the same base URL and authorization header. Centralizing them in one file means base URL changes, interceptor additions, or library swaps happen in one place. `authHeaders()` reads the token at call time — not at module import — so it always reflects the current localStorage value without stale closures.

**Why `loginUser.fulfilled.match()` instead of try/catch after dispatch?**
`createAsyncThunk` with `rejectWithValue` never throws — it returns a rejected action. A `catch` block after `await dispatch(loginUser())` never fires for API errors, only for unexpected JS exceptions. `loginUser.fulfilled.match(resultAction)` is the pattern RTK documents for this case: it inspects the action type directly and handles both outcomes in the same flow.

**Why `LS_KEYS` object in `thunk.js`?**
localStorage key strings repeated across `setItem`, `getItem`, and `removeItem` calls are a source of silent bugs — a typo in one call breaks session restore without any error. Collecting all keys in one object means a key rename is a single-line change and typos are caught at the object definition.

**Why `disabled` on submit buttons during loading instead of `onClick={undefined}`?**
`disabled` is a native HTML attribute that blocks the click event, prevents form submission via Enter key, and is communicated to assistive technologies as non-interactive. Setting `onClick={undefined}` only removes the JS handler — the button remains interactive in the accessibility tree and can still submit the form via keyboard.

**Why `status: 'idle' | 'loading' | 'succeeded' | 'failed'` in every slice?**
A boolean `isLoading` flag cannot represent the full lifecycle — it cannot distinguish "never fetched" from "fetched successfully" from "failed". The four-value status string matches the RTK convention, enables skeleton states, prevents duplicate fetches when status is already `'loading'`, and is the same pattern the RTK documentation recommends.

**Why server-side role assignment instead of email comparison on the frontend?**
The previous implementation set `role = 'admin'` if `email === 'admin@email.com'` in the frontend thunk. Any user who registers with that email address gets admin access without the server knowing. Role is now read from `result.user.role` returned by the login endpoint — the backend decides, the frontend only reads.

**Why `buildStore()` in each test file instead of importing from `store/index.js`?**
Importing the production store into tests couples test code to the production store configuration. If the production store adds middleware or changes shape, tests break for unrelated reasons. Each test file constructs an isolated store with only the reducers it needs — changes to the production store do not affect tests that do not exercise that slice.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | React 18 — functional components, hooks | Stable, widely adopted, hooks-based composition |
| Language | JavaScript (ES2021), PropTypes | Lightweight type safety at component boundaries |
| State | Redux Toolkit — createSlice, createAsyncThunk | Generated action types, built-in Immer, RTK conventions |
| HTTP | Axios via centralized services.js | Consistent base URL, auth headers, error shape |
| Routing | React Router v6 | Nested routes, PrivateRoute pattern, useNavigate |
| Testing | React Testing Library + Vitest | Component behaviour, not implementation details |
| Linting | ESLint (Airbnb) + Prettier | Enforced style, pre-commit via Husky |
| Container | Docker multi-stage (Node 18 builder + Nginx Alpine) | Small image, no Node.js in production |
| Server | Nginx with SPA routing and reverse proxy | index.html fallback, backend on private network |

---

## Running Locally

### Prerequisites

- Node.js 18+

```bash
node --version   # v18.x.x or higher
npm --version    # 9.x.x or higher
```

### Step 1 — Install dependencies

```bash
npm install
cd backend-mock && npm install && cd ..
```

### Step 2 — Create environment file

```bash
echo "REACT_APP_API_URL=http://localhost:4000" > .env.local
```

### Step 3 — Start the backend

```bash
# Terminal 1
cd backend-mock
npm start
# Mock API running at http://localhost:4000
```

### Step 4 — Start the frontend

```bash
# Terminal 2
npm start
# App running at http://localhost:3000
```

### Test credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@test.com` | `admin123` |
| User | `user@test.com` | `user123` |

Admin sees CREATE, UPDATE and DELETE controls. User sees the course catalogue only.

---

## Docker

### Multi-stage build

```
Stage 1 — Node 18 Alpine (builder)
  npm ci
  npm run build

Stage 2 — Nginx Alpine (runtime)
  static files from Stage 1 only
  nginx.conf (SPA routing, reverse proxy to backend)
```

No Node.js in the final image.

### Build and run with Docker Compose

```bash
docker compose up --build
```

```
Browser → Nginx (port 80) → React build (static)
                          → /api/* → Backend (port 4000, private network)
```

App available at `http://localhost`. Backend not directly reachable from outside the Docker network.

```bash
# Stop
docker compose down
```

---

## Running Tests

```bash
# All tests, single run
npm run test:ci

# Watch mode during development
npm test

# Lint
npm run lint
npm run lint:fix

# Format
npm run format
```

### What is tested

Unit tests cover business logic and component behaviour — not CSS, not routing internals.

| Test file | What it covers |
|---|---|
| `reducer.test.js` | courses slice — initial state, createCourse.fulfilled, fetchCourses.pending / rejected, deleteCourse.fulfilled |
| `courses.test.js` | Courses component — card count matches store, navigation on "Add new course" |
| `header.test.js` | Header component — logo present, username displayed, Logout button for authenticated user |
| `courseCard.test.js` | CourseCard component — title, description, duration format, authors list, date format, admin buttons |

Tools: React Testing Library · `configureStore` with `preloadedState` · `jest.fn()` for navigation mocks

Not unit tested: routing integration, form submission end-to-end, Docker configuration.

---

## Project Structure

```
react-course-app/
├── src/
│   ├── common/
│   │   ├── Button/            # type, disabled, onClick — no defaultProps
│   │   └── Input/             # error display, default values in destructuring
│   ├── components/
│   │   ├── CourseForm/        # Create / update — mode from useParams(:courseId)
│   │   ├── CourseInfo/        # Detail — useSelector, formatCreationDate, getCourseDuration
│   │   ├── Courses/           # List — useMemo filter, loading state, role-based controls
│   │   ├── Header/            # Login / Logout, username from store
│   │   ├── Login/             # loginUser.fulfilled.match(), disabled during loading
│   │   ├── PrivateRoute/      # role === 'admin' + redirect with return URL
│   │   └── Registration/      # registerUserService, try/catch, server errors in UI
│   ├── helpers/
│   │   ├── formatCreationDate.js
│   │   └── getCourseDuration.js
│   ├── mocks/
│   │   └── mockedData.js      # Fixture data — not imported in production code
│   ├── store/
│   │   ├── user/              # reducer.js + thunk.js (LS_KEYS, persistUserToStorage)
│   │   ├── courses/           # reducer.js + thunk.js + tests/
│   │   ├── authors/           # reducer.js + thunk.js
│   │   └── index.js           # configureStore — default export only
│   ├── App.jsx                # Routes, fetchUser + fetchCourses + fetchAuthors on mount
│   ├── services.js            # All axios calls, authHeaders() helper
│   ├── constants.js           # Validation limits, UI labels, CSS class names
│   └── config.js              # REACT_APP_API_URL
├── backend-mock/
│   ├── server.js              # json-server with custom auth endpoints
│   └── db.json                # Users, courses, authors seed data
├── public/
├── .vscode/
│   └── settings.json          # formatOnSave, ESLint on save, tabSize: 2
├── Dockerfile                 # Single-container: builder + Nginx runtime
├── Dockerfile.multi-container # Multi-container variant (used by docker-compose)
├── docker-compose.yml         # frontend + backend on private app-network
├── nginx.conf                 # SPA fallback, /api proxy, gzip
├── server-railway.js          # Express + json-server for Railway deployment
├── .eslintrc.json             # eslint:recommended + react-hooks + prettier
├── .prettierrc.json           # singleQuote, printWidth: 80, trailingComma: es5
└── package.json               # dependencies / devDependencies — no test libs in prod bundle
```

---

## Deployment

Deployed on **Railway** as a single container (`server-railway.js` — Express serves the React build and mounts all API routes under `/api`).

**Live:** https://react-app-production-d055.up.railway.app

Auto-deploys on push to `main`. First load after inactivity takes 30–60 seconds on the Railway free tier — subsequent loads are instant.

---

## Author

**Łukasz Pławiak**
- GitHub: https://github.com/lukaszplawiak
- LinkedIn: https://www.linkedin.com/in/lukasz-p-dev/

---

MIT License