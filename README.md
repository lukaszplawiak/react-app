# Course Platform — Frontend

React · Redux Toolkit · React Router · Axios · Vite · Vitest · Docker

React 18 SPA for managing online courses — a portfolio project demonstrating modern frontend patterns: Redux Toolkit with async thunks, role-based access control, custom hooks architecture, centralized API layer, and containerized deployment.

[Live Demo](https://react-app-production-d055.up.railway.app) — first load after inactivity may take 30–60 seconds (Railway free tier)

[Overview](#overview) · [Architecture](#architecture) · [Design Decisions](#design-decisions) · [Tech Stack](#tech-stack) · [Running Locally](#running-locally) · [Docker](#docker) · [Running Tests](#running-tests) · [Security Notes](#security-notes) · [Project Structure](#project-structure)

---

## Overview

A course management dashboard where administrators create, update and delete courses and authors, while regular users browse and search the catalogue. Authentication is cookie-based with role-derived UI — admin-only controls are absent from the DOM for non-admin users, not merely hidden via CSS.

### What the application covers

- **Authentication** — login and registration backed by HttpOnly cookie session; automatic session restore on page reload via `fetchUser` on app mount; data fetching deferred until auth is confirmed
- **Course management** — full CRUD for courses and authors; admin-only write operations enforced at the route level via `PrivateRoute requireAdmin`
- **Search** — client-side title filter with `useMemo` to avoid redundant recomputation on every keystroke
- **Form architecture** — `useCourseForm`, `useLoginForm`, `useRegistrationForm` custom hooks extract all business logic from components; components are pure JSX
- **Loading states** — `status: bootstrapping | idle | loading | succeeded | failed` in every Redux slice; submit buttons disabled and labels changed during in-flight requests to prevent duplicate submissions
- **Error surfaces** — all API errors propagated through `rejectWithValue` and rendered in the UI; delete errors shown inline without collapsing the course list; no silent failures
- **Deployment** — multi-container Docker setup (React build served by Nginx, backend mock on a private network) and single-container Railway deployment (Express + Nginx)

---

## Architecture

```
src/
├── common/
│   ├── Button/                # Reusable button — type, disabled, onClick props
│   ├── Input/                 # Reusable input — error display, type, placeholder
│   └── ErrorMessage/          # Error display with optional retry callback
│
├── components/
│   ├── CourseForm/            # Create and update — one component, mode from useParams
│   │   ├── hooks/
│   │   │   └── useCourseForm.js     # All form logic: fields, validation, submit, authors
│   │   └── components/
│   │       └── AuthorItem/          # Add / remove author row
│   ├── CourseInfo/            # Detail view — reads store via selectors
│   ├── Courses/               # List view — filter, delete error, admin controls
│   │   └── components/
│   │       ├── CourseCard/    # Presentational only — all callbacks via props
│   │       ├── EmptyCourseList/
│   │       └── SearchBar/
│   ├── Header/                # Logo, username, Login / Logout
│   ├── Login/
│   │   └── hooks/
│   │       └── useLoginForm.js      # Validation, dispatch, navigation
│   ├── PrivateRoute/          # requireAdmin prop — two access levels in one component
│   └── Registration/
│       └── hooks/
│           └── useRegistrationForm.js
│
├── helpers/
│   ├── formatCreationDate.js  # Date → DD.MM.YYYY (Intl.DateTimeFormat, UTC-safe)
│   ├── getAuthorNames.js      # authorIds[] + authors[] → display string, truncate option
│   └── getCourseDuration.js   # Minutes → HH:MM hours, guards for null/NaN/negative
│
├── store/
│   ├── user/
│   │   ├── reducer.js         # name, email, isAuth, role, status, error
│   │   ├── selectors.js       # selectIsAuth, selectIsAdmin, selectUserStatus, …
│   │   └── thunk.js           # fetchUser, loginUser, logoutUser, registerUser
│   ├── courses/
│   │   ├── reducer.js         # courses[], status, error — all CRUD cases
│   │   ├── selectors.js       # selectCourses, selectCoursesStatus, selectCoursesError
│   │   ├── thunk.js           # fetchCourses, createCourse, updateCourse, deleteCourse
│   │   ├── reducer.test.js    # Slice unit tests — colocated
│   │   └── thunk.test.js      # Thunk integration tests — colocated
│   ├── authors/
│   │   ├── reducer.js
│   │   ├── selectors.js       # selectAuthors, selectAuthorsStatus, selectAuthorsError
│   │   └── thunk.js           # fetchAuthors, createAuthor
│   └── index.js               # configureStore — single export
│
├── constants/
│   ├── validation.js          # MIN_PASSWORD_LENGTH, MIN_COURSE_TITLE_LENGTH, …
│   └── ui.js                  # ADD_NEW_COURSE_LABEL, HAS_ERROR_CLASS, …
│
├── mocks/
│   └── Mockeddata.js          # Static fixture data — not imported in production code
│
├── services.js                # All axios calls — one client, response interceptor
├── config.js                  # VITE_API_URL with /api fallback
└── index.jsx                  # React root — StrictMode, Provider, BrowserRouter
```

---

## Design Decisions

**Why custom hooks for every form (`useCourseForm`, `useLoginForm`, `useRegistrationForm`)?**
Components handle JSX. Hooks handle logic. A form component with `useState`, `useEffect`, `useSelector`, `dispatch`, validation and navigation is doing five jobs at once. Extracting the logic into a hook makes both parts independently testable — the hook with `renderHook`, the component with simple prop mocks. This follows the same pattern React's own docs recommend and matches how `react-hook-form` is designed.

**Why `PrivateRoute` with a `requireAdmin` prop instead of two separate components?**
A single `PrivateRoute` is the single source of truth for access control in routing. Adding `requireAdmin` gives two access levels without duplicating the auth check. Reading the route table in `App.jsx` is immediately informative — `<PrivateRoute>` means authenticated, `<PrivateRoute requireAdmin>` means authenticated admin — no need to look up two different component implementations.

**Why are `fetchCourses` and `fetchAuthors` in a separate `useEffect` with `[isAuth]` dependency?**
Fetching all data unconditionally on app mount sends requests for resources the unauthenticated user will never see. Splitting into two effects — one for `fetchUser` (always), one for data (only when `isAuth` is true) — means unauthenticated users generate one request, not three. The data effect re-runs automatically when `isAuth` transitions to `true` after login.

**Why `isSaving` is local state in `useCourseForm` instead of derived from `coursesStatus`?**
`coursesStatus === 'loading'` is set by `fetchCourses`, `createCourse` and `updateCourse` — all three. A background refresh while the user is filling the form would incorrectly block the submit button. Local `useState(false)` scoped to the submission event is accurate: `true` from the moment submit is clicked until the response arrives, regardless of what the slice status is doing.

**Why `deleteError` is local state in `Courses.jsx` instead of stored in Redux?**
A delete failure is a transient UI event — it is relevant only while the user is looking at the list right now. Putting it in Redux would mean the error persists across navigation, requires cleanup actions, and adds reducer cases for UI state that no other component shares. `useState(null)` in the component it belongs to is the correct scope.

**Why Redux Toolkit instead of plain Redux or Zustand?**
RTK eliminates the boilerplate of manual action type strings, action creators and switch-case reducers. `createAsyncThunk` generates `pending / fulfilled / rejected` action types automatically and integrates directly with `extraReducers`. The slice pattern enforces consistent state shape across the three domains. Zustand would work for simpler state but RTK is the standard in enterprise React and better demonstrates understanding of the full Redux lifecycle.

**Why a single `services.js` instead of per-feature API files?**
All HTTP calls share the same base URL, `withCredentials: true`, and the same response interceptor (401 redirect, centralized error logging). A single Axios instance configured once means base URL changes, interceptor additions or library swaps happen in one file. Per-feature files would either duplicate the client setup or import from a shared module — adding indirection without benefit.

**Why `loginUser.fulfilled.match()` instead of try/catch after dispatch?**
`createAsyncThunk` with `rejectWithValue` never throws — it always returns an action. A `catch` block after `await dispatch(loginUser())` never fires for API errors, only for unexpected JavaScript exceptions. `.fulfilled.match(result)` is the pattern RTK documents for this: it inspects the action type and handles both outcomes in the same synchronous flow.

**Why selectors in separate files per slice?**
Consistency and encapsulation. Components never access `state.courses.courses` directly — they use `selectCourses(state)`. If the slice shape changes, only the selector file changes, not every component that reads that value. The pattern mirrors what `reselect` and RTK's own documentation recommend.

**Why `buildStore()` in each test file instead of importing the production store?**
The production store may have middleware, devtools or shape changes that are irrelevant to a specific test. Each test file constructs an isolated store with only the reducers it exercises. A change to the production store configuration cannot break tests that do not involve that slice.

**Why tests are colocated with source files (`.test.jsx` next to `.jsx`)?**
Colocated tests are the current industry standard — Vite, Vitest and the Testing Library documentation all recommend this layout. A test file next to its source is immediately visible when editing the component, and removing a component also makes the orphaned test obvious. The `tests/` subfolder pattern belongs to older Java-style project structures.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | React 18 — functional components, hooks | Stable, widely adopted, hooks composition |
| Language | JavaScript (ES2021) + PropTypes | Lightweight type safety at component boundaries |
| State | Redux Toolkit — createSlice, createAsyncThunk | Generated action types, built-in Immer, RTK conventions |
| HTTP | Axios — centralized services.js, response interceptor | Consistent base URL, 401 redirect, error logging |
| Routing | React Router v6 — PrivateRoute, useNavigate | Declarative route protection, nested routes |
| Build | Vite | Sub-second cold start, native ES modules, fast HMR |
| Testing | Vitest + React Testing Library | Component behaviour over implementation, renderHook for hooks |
| Linting | ESLint (Airbnb config) + Prettier | Enforced style, pre-commit hook via Husky |
| Container | Docker multi-stage — Node 18 builder + Nginx Alpine | Small final image, no Node.js in production |
| Server | Nginx — SPA routing, gzip, reverse proxy | index.html fallback, backend on private Docker network |
| Deployment | Railway — single container, Express + json-server | Auto-deploy on push to main |

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
echo "VITE_API_URL=http://localhost:4000" > .env.local
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

### Multi-container setup (docker-compose)

```
Stage 1 — Node 18 Alpine (builder)
  npm ci
  VITE_API_URL=/api (build-time ARG)
  npm run build → /app/build

Stage 2 — Nginx Alpine (runtime)
  static files from Stage 1 only
  nginx.conf — SPA fallback, /api reverse proxy, gzip
```

No Node.js in the final frontend image.

```bash
docker compose up --build
```

```
Browser → Nginx (port 80) → React build (static files)
                           → /api/* → Backend container (port 4000, private network)
```

App available at `http://localhost`. Backend is not reachable directly from outside the Docker network.

```bash
# Stop
docker compose down
```

### Single-container Railway build

```bash
docker build -t course-app .
docker run -p 3000:3000 course-app
```

Uses `server-railway.js` — Express serves the React build and all API routes under `/api` from the same process.

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

### Test coverage

72 tests across all layers — store, components, helpers and custom hooks.

| Test file | What it covers |
|---|---|
| `store/courses/reducer.test.js` | Courses slice — initial state, `createCourse.fulfilled`, `fetchCourses.pending/rejected`, `deleteCourse.fulfilled` |
| `store/courses/thunk.test.js` | All four thunks — success paths, rejection, `successful: false` response handling |
| `helpers/formatCreationDate.test.js` | Date formatting — zero-padded day/month, UTC safety, invalid input guard |
| `components/Header/header.test.jsx` | Logo present, username displayed, Logout dispatched and navigation to `/login` |
| `components/Courses/courses.test.jsx` | Card count matches store, loading state, navigation to `/courses/add`, admin button visibility |
| `components/Courses/components/CourseCard/courseCard.test.jsx` | Title, description, duration format, authors list, date format, admin buttons, `onDelete` callback |
| `components/CourseForm/hooks/useCourseForm.test.jsx` | Create/edit mode, `register()`, validation, submit success/failure, `isSaving` lifecycle, author management, `handleCreateAuthor` |
| `components/Login/hooks/useLoginForm.test.jsx` | Initial state, `handleChange`, validation, success navigation to `/courses`, server error on failure |
| `components/Registration/hooks/useRegistrationForm.test.jsx` | Initial state, `handleChange`, all three field validations, success navigation to `/login`, server error |

**Approach:** `configureStore` with `preloadedState` — no `redux-mock-store`. Hook tests use `renderHook` from Testing Library. All test files colocated with their source.

---

## Security Notes

This project uses a JSON file (`db.json`) as its database and `json-server` as a backend mock — chosen for simplicity of deployment and demonstration, not for production use. Known limitations of this setup, and how they would be addressed in a production system:

| Limitation | Production approach |
|---|---|
| Passwords stored in plaintext in `db.json` | `bcrypt` or `argon2` hashing; never store plaintext |
| Tokens are predictable `Date.now()` strings | `crypto.randomBytes(32).toString('hex')` or signed JWT |
| No authorization middleware on write endpoints | Auth middleware on every protected route; role checked server-side |
| No rate limiting on login endpoint | `express-rate-limit` or API gateway throttling |
| No Content Security Policy headers | CSP, `X-Frame-Options`, `HSTS`, `Referrer-Policy` in Nginx config |
| `secure: true` not set on auth cookie | Required in production HTTPS environments |

**What is correctly implemented:**
- Auth cookie with `httpOnly: true` — JavaScript cannot access the session token
- `sameSite: 'lax'` — CSRF protection for cross-origin GET requests
- `withCredentials: true` on Axios — credentials included automatically
- Role-based UI — admin controls absent from DOM, not just CSS-hidden
- `PrivateRoute` with `requireAdmin` — route-level access control on the client
- No `dangerouslySetInnerHTML` or `eval` anywhere in the codebase
- 401 interceptor — expired sessions redirect to login automatically

---

## Project Structure

```
react-course-app/
├── src/
│   ├── common/
│   │   ├── Button/
│   │   ├── ErrorMessage/
│   │   └── Input/
│   ├── components/
│   │   ├── CourseForm/
│   │   │   ├── hooks/
│   │   │   │   ├── useCourseForm.js
│   │   │   │   └── useCourseForm.test.jsx
│   │   │   └── components/AuthorItem/
│   │   ├── CourseInfo/
│   │   ├── Courses/
│   │   │   ├── components/
│   │   │   │   ├── CourseCard/
│   │   │   │   │   ├── CourseCard.jsx
│   │   │   │   │   └── courseCard.test.jsx
│   │   │   │   ├── EmptyCourseList/
│   │   │   │   └── SearchBar/
│   │   │   ├── Courses.jsx
│   │   │   └── courses.test.jsx
│   │   ├── Header/
│   │   │   ├── Header.jsx
│   │   │   └── header.test.jsx
│   │   ├── Login/
│   │   │   └── hooks/
│   │   │       ├── useLoginForm.js
│   │   │       └── useLoginForm.test.jsx
│   │   ├── PrivateRoute/
│   │   └── Registration/
│   │       └── hooks/
│   │           ├── useRegistrationForm.js
│   │           └── useRegistrationForm.test.jsx
│   ├── helpers/
│   │   ├── formatCreationDate.js
│   │   ├── formatCreationDate.test.js
│   │   ├── getAuthorNames.js
│   │   └── getCourseDuration.js
│   ├── store/
│   │   ├── user/
│   │   │   ├── reducer.js
│   │   │   ├── selectors.js
│   │   │   └── thunk.js
│   │   ├── courses/
│   │   │   ├── reducer.js
│   │   │   ├── reducer.test.js
│   │   │   ├── selectors.js
│   │   │   ├── thunk.js
│   │   │   └── thunk.test.js
│   │   ├── authors/
│   │   │   ├── reducer.js
│   │   │   ├── selectors.js
│   │   │   └── thunk.js
│   │   └── index.js
│   ├── constants/
│   │   ├── validation.js
│   │   └── ui.js
│   ├── mocks/
│   │   └── Mockeddata.js
│   ├── App.jsx
│   ├── services.js
│   ├── config.js
│   └── index.jsx
├── backend-mock/
│   ├── server.js              # json-server with custom auth, HttpOnly cookie
│   └── db.json                # Seed data — users, courses, authors
├── public/
├── .vscode/
│   └── settings.json          # formatOnSave, ESLint on save
├── Dockerfile                 # Single-container: multi-stage builder + Express runtime
├── Dockerfile.multi-container # Multi-container: multi-stage builder + Nginx runtime
├── docker-compose.yml         # frontend (Nginx) + backend on private app-network
├── nginx.conf                 # SPA fallback, /api proxy to backend container, gzip
├── nginx.render.conf          # SPA fallback, /api proxy to localhost:3001, gzip
├── server-railway.js          # Express — serves React build + all /api routes
├── .eslintrc.json             # eslint:recommended + react/recommended + react-hooks + prettier
├── .prettierrc.json           # singleQuote, printWidth: 80, trailingComma: es5
├── vite.config.js             # Vite + Vitest config — globals, jsdom, setupFiles
└── package.json
```

---

## Deployment

Deployed on **Railway** as a single container. `server-railway.js` — Express serves the React build statically and mounts all API routes under `/api`.

**Live:** https://react-app-production-d055.up.railway.app

Auto-deploys on push to `main`. First load after inactivity takes 30–60 seconds on the Railway free tier.

---

## Author

**Łukasz Pławiak**
- GitHub: [github.com/lukaszplawiak](https://github.com/lukaszplawiak)
- LinkedIn: [linkedin.com/in/lukasz-p-dev](https://www.linkedin.com/in/lukasz-p-dev/)

---

MIT License