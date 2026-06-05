# Course Management App

[![CI](https://github.com/lukaszplawiak/course-management-app/actions/workflows/ci.yml/badge.svg)](https://github.com/lukaszplawiak/course-management-app/actions/workflows/ci.yml)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-2563eb)](LICENSE)

A React 19 SPA for managing online courses — a portfolio project demonstrating modern frontend patterns: Redux Toolkit 2 with typed async thunks, role-based access control, custom hooks architecture, centralized API layer, enrollment system, and containerized deployment.

[Live Demo](https://react-app-production-d055.up.railway.app) — first load after inactivity may take 30–60 seconds (Railway free tier)

[Overview](#overview) · [Architecture](#architecture) · [Design Decisions](#design-decisions) · [Tech Stack](#tech-stack) · [Running Locally](#running-locally) · [Docker](#docker) · [Running Tests](#running-tests) · [Security Notes](#security-notes) · [Project Structure](#project-structure)

---

## Overview

A course management dashboard where administrators create, update and delete courses and authors, while regular users browse, search and enroll in courses. Authentication is cookie-based with role-derived UI — admin-only controls are absent from the DOM for non-admin users, not merely hidden via CSS.

### What the application covers

- **Authentication** — login and registration backed by HttpOnly cookie session; automatic session restore on page reload via `fetchUser` on app mount; data fetching deferred until auth is confirmed
- **Course management** — full CRUD for courses and authors; admin-only write operations enforced at the route level via `PrivateRoute requireAdmin`
- **Enrollment system** — users can enroll in courses; enrollment state tracked in Redux; enroll button disabled during in-flight request to prevent duplicate submissions; errors surfaced inline
- **Enrolled Students view** — admin-only table showing all enrollments: student email, course name and enrollment date; accessible via Header
- **Search** — client-side title filter with `useMemo` to avoid redundant recomputation on every keystroke
- **Form architecture** — `useCourseForm`, `useLoginForm`, `useRegistrationForm` custom hooks extract all business logic from components; components are pure JSX
- **Bootstrap hook** — `useAppBootstrap` centralises all app-level data fetching: session check always, courses and authors once authenticated, enrollments for admin only
- **Loading states** — `status: bootstrapping | idle | loading | succeeded | failed` in every Redux slice; submit buttons disabled and labels changed during in-flight requests to prevent duplicate submissions
- **Error surfaces** — all API errors propagated through `rejectWithValue` and rendered in the UI; delete errors shown inline without collapsing the course list; enroll errors shown below the button; no silent failures
- **Error boundary** — `ErrorBoundary` at the application root catches runtime errors and renders a graceful fallback with a reset button instead of a blank screen
- **Deployment** — multi-container Docker setup (React build served by Nginx, backend mock on a private network) and single-container Railway deployment (Express + Nginx)

---

## Architecture

### Application layers

```
Browser
  └── React 19 (SPA)
        ├── React Router 7      — declarative routing, PrivateRoute guards
        ├── Redux store         — single source of truth for all async state
        │     ├── user slice    — auth state, role, bootstrap status
        │     ├── courses slice — CRUD state
        │     ├── authors slice — author list
        │     └── enrollments slice
        ├── Axios (services.ts) — single HTTP client, response interceptor
        └── Backend mock API    — json-server + Express (port 4000 / /api)
```

### Startup sequence

On every page load, `useAppBootstrap` runs three effects in order:

1. `fetchUser` — always fires; calls `GET /users/me` with the HttpOnly cookie. If the session is valid the user slice populates and `isAuth` becomes `true`. If not, the slice resets to `idle` and the user sees the login page. `isBootstrapping` blocks rendering until this resolves.
2. `fetchCourses` + `fetchAuthors` — fire once `isAuth` is `true`. Unauthenticated users never trigger these requests.
3. `fetchEnrollments` — fires once `isAuth && isAdmin`. Regular users never fetch enrollment data.

### Authentication and routing

Every protected route is wrapped in `PrivateRoute`. On render it reads `isAuth` and `isAdmin` from the store:

- Not authenticated → redirect to `/login?redirect=<original path>`
- Authenticated, not admin, `requireAdmin` route → redirect to `/courses`
- Authenticated (and admin where required) → render children

After login, `useLoginForm` reads the `redirect` query param, validates it is a safe same-origin path, and navigates there — completing the round trip.

### HTTP layer

All API calls go through a single Axios instance in `services.ts` with `withCredentials: true`. A response interceptor handles two cross-cutting concerns:

- **401 responses** — redirect to `/login` for all endpoints except `/users/me` (where a 401 is the expected unauthenticated response during bootstrap)
- **Error logging** — errors are logged to the console in development only (`import.meta.env.DEV`); in production they should go to a monitoring service

### State management

Each domain has a Redux slice with a consistent shape: `{ data, status: LoadingStatus, error }`. Thunks use `createAsyncThunk` with `rejectWithValue` — errors always surface to the UI, never swallowed silently. Components never access `state.slice.field` directly — they go through typed selectors.

`selectIsEnrolled` is a parametric selector `(state, courseId) => boolean` rather than a curried factory, so `useSelector` can compare the boolean result by value and skip re-renders when enrollment status hasn't changed.

### Form architecture

Each form has a dedicated custom hook (`useCourseForm`, `useLoginForm`, `useRegistrationForm`) that owns fields, validation, dispatch and navigation. Components are pure JSX — they receive values and handlers from the hook and render them. This makes hooks independently testable with `renderHook` and keeps components free of business logic.

`useCourseForm` uses a `useRef` one-shot flag to initialize edit-mode fields only once — subsequent store updates (background refetches, concurrent deletes) do not overwrite unsaved user input.

### Error handling

Every async operation surfaces errors at the appropriate scope:

- **Global** — `ErrorBoundary` at the root catches runtime errors and shows a reset UI instead of a blank screen
- **Page-level** — fetch failures (courses, authors) render an `ErrorMessage` with a retry button
- **Inline** — mutation failures (delete, enroll) render errors next to the triggering control without collapsing the surrounding UI
- **Form** — validation errors per field, server error below the submit button

---

## Design Decisions

**Why TypeScript instead of JavaScript?**
TypeScript catches shape mismatches between API responses and Redux state at compile time, not at runtime in production. The store's `RootState` and `AppDispatch` types flow through selectors, thunks and components without casting. `UserRole`, `LoadingStatus` and domain interfaces serve as living documentation — a change to `Course` immediately surfaces every component that needs updating.

**Why custom hooks for every form (`useCourseForm`, `useLoginForm`, `useRegistrationForm`)?**
Components handle JSX. Hooks handle logic. A form component with `useState`, `useEffect`, `useSelector`, `dispatch`, validation and navigation is doing five jobs at once. Extracting the logic into a hook makes both parts independently testable — the hook with `renderHook`, the component with simple prop mocks.

**Why `useAppBootstrap` instead of effects in `App.tsx`?**
`App.tsx` is responsible for routing. Putting three `useEffect` calls for data fetching alongside routing logic violates the Single Responsibility Principle. `useAppBootstrap` owns the bootstrap sequence — `fetchUser` always, courses and authors once authenticated, enrollments for admin — and returns `{ isBootstrapping }` so `App` retains the loading gate without knowing the details.

**Why `PrivateRoute` with a `requireAdmin` prop instead of two separate components?**
A single `PrivateRoute` is the single source of truth for access control in routing. Reading the route table in `App.tsx` is immediately informative: `<PrivateRoute>` means authenticated, `<PrivateRoute requireAdmin>` means authenticated admin.

**Why are `fetchCourses` and `fetchAuthors` in a separate `useEffect` with `[isAuth]` dependency?**
Fetching all data unconditionally on app mount sends requests for resources the unauthenticated user will never see. Splitting into two effects — one for `fetchUser` (always), one for data (only when `isAuth` is true) — means unauthenticated users generate one request, not four.

**Why `selectIsEnrolled(state, courseId)` instead of a curried factory `selectIsEnrolled(courseId)(state)`?**
The curried factory pattern called inside `render` returns a new function reference on every render. `useSelector` uses referential equality to decide whether to re-run, so a new reference forces a re-run on every store update — even unrelated ones. The parametric selector `(state, courseId) => boolean` called via `useSelector((state) => selectIsEnrolled(state, id))` avoids this: the boolean result is compared by value, and re-renders only fire when enrollment status actually changes.

**Why `initializedRef` in `useCourseForm`?**
The edit form's `useEffect` initializes fields from the store when the course is found. Without a guard, any store update (a background refetch, a concurrent delete) would re-run the effect and overwrite whatever the user had typed. `useRef(false)` acts as a one-shot flag: the form populates once, then the effect is a no-op for all subsequent store changes.

**Why `isSaving` is local state in `useCourseForm` instead of derived from `coursesStatus`?**
`coursesStatus === 'loading'` is set by `fetchCourses`, `createCourse` and `updateCourse` — all three. A background refresh while the user is filling the form would incorrectly block the submit button. Local `isSaving` scoped to the submission event is accurate: `true` from the moment submit is clicked until the response arrives.

**Why `deleteError` and `enrollError` are local state instead of stored in Redux?**
These are transient UI events — relevant only while the user is looking at that component right now. Putting them in Redux would mean errors persist across navigation, require cleanup actions, and add reducer cases for UI state that no other component shares.

**Why `ErrorBoundary` is a class component?**
React's `getDerivedStateFromError` and `componentDidCatch` lifecycle methods have no hook equivalents — this is the one case where a class component is the only correct choice in React 19. Placed at the root above `<App>` so any unhandled runtime error shows a graceful fallback with a reset button instead of a blank screen.

**Why `Button` renders `<span>` when both `to` and `disabled` are passed?**
`<Link>` has no native `disabled` state — ignoring the prop would leave a clickable navigation element that appears inactive. A `<span>` with `aria-disabled="true"` and the same CSS classes looks identical but does not navigate and is not in the keyboard tab order.

**Why Redux Toolkit 2 instead of plain Redux or Zustand?**
RTK eliminates boilerplate, `createAsyncThunk` generates `pending / fulfilled / rejected` action types automatically, and the slice pattern enforces consistent state shape. RTK 2 tightened the `Reducer` generic — `preloadedState` must satisfy the slice's exact type — which catches shape mismatches in tests.

**Why a single `services.ts` instead of per-feature API files?**
All HTTP calls share the same base URL, `withCredentials: true`, and the same response interceptor (401 redirect, dev-only error logging). A single Axios instance configured once means base URL changes happen in one file.

**Why `loginUser.fulfilled.match()` instead of try/catch after dispatch?**
`createAsyncThunk` with `rejectWithValue` never throws — it always returns an action. A `catch` block after `await dispatch(loginUser())` never fires for API errors. `.fulfilled.match(result)` is the RTK-documented pattern for this.

**Why `buildStore()` in each test file instead of importing the production store?**
Each test file constructs an isolated store with only the reducers it exercises. RTK 2 requires `preloadedState` to satisfy slice types exactly — typed constants per slice state enforce this and make the test setup self-documenting.

**Why tests are colocated with source files?**
A test file next to its source is immediately visible when editing the component. Removing a component makes the orphaned test obvious. This is the layout Vite, Vitest and Testing Library documentation recommend.

**Why Renovate with `minimumReleaseAge: "3 days"` instead of Dependabot?**
Dependabot opens PRs immediately when a new package version is published. Supply chain attacks — where a trusted package receives a malicious update — are typically detected by the community within hours (event-stream 2018, ua-parser-js 2021, node-ipc 2022). A 3-day delay means the community has time to discover the problem before this repository automatically pulls in the affected version. Dependabot has no equivalent of `minimumReleaseAge`. Known CVEs bypass the delay entirely — a confirmed vulnerability needs immediate remediation, which is a different risk profile from an unknown supply chain attack. Renovate also supports grouped PRs, automerge conditions per update type, and shared presets across multiple repositories.

**Why Renovate and Socket.dev together?**
They protect against supply chain risk at different layers. Renovate operates on time — it delays pulling new versions until the community has had a chance to react. Socket.dev operates on code analysis — it scans each new package version for suspicious changes: new network access, obfuscated code, new install scripts, new maintainers. A sophisticated attack that goes unnoticed for 3 days would still be caught by Socket if the malicious code exhibits anomalous behaviour patterns. Together they form a two-layer defence: temporal delay plus static analysis of the package itself.

---

## Tech Stack

| Layer                 | Technology                                        | Why                                                                                       |
| --------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Framework             | React 19 — functional components, hooks           | Latest stable; no breaking changes vs 18 for this codebase                                |
| Language              | TypeScript 5.4                                    | Typed store, typed selectors, typed API responses; zero `any` in production code          |
| State                 | Redux Toolkit 2 — createSlice, createAsyncThunk   | RTK 2 stricter generics, Immer built-in, standard in enterprise React                     |
| HTTP                  | Axios — typed `services.ts`, response interceptor | Consistent base URL, 401 redirect, dev-only error logging                                 |
| Routing               | React Router 7 — PrivateRoute, useNavigate        | Full backward compatibility with v6 hooks API                                             |
| Build                 | Vite 8                                            | Sub-second cold start, native ES modules, fast HMR                                        |
| Testing               | Vitest 4 + React Testing Library                  | Component behaviour over implementation, `renderHook` for hooks                           |
| Linting               | ESLint 9 (flat config) + Prettier                 | `eslint.config.js`, typescript-eslint, react-hooks rules, pre-commit via Husky 9          |
| Import sorting        | `@trivago/prettier-plugin-sort-imports`           | Single tool for import order — avoids conflict with `eslint-plugin-import`                |
| Dependency updates    | Renovate — `minimumReleaseAge: 3 days`            | Supply chain attack protection; CVEs bypass delay; grouped PRs, automerge for patches     |
| Supply chain scanning | Socket.dev — static analysis on every PR          | Detects suspicious package changes (new network access, obfuscated code, new maintainers) |
| Container             | Docker multi-stage — Node builder + Nginx Alpine  | Small final image, no Node.js in production                                               |
| Server                | Nginx — SPA routing, gzip, reverse proxy          | `index.html` fallback, backend on private Docker network                                  |
| Deployment            | Railway — single container, Express + json-server | Auto-deploy on push to master                                                             |

---

## Running Locally

### Prerequisites

- Node.js 18+

```bash
node --version   # v18.x.x or higher
```

### Step 1 — Install dependencies

```bash
npm install
cd backend-mock && npm install && cd ..
```

### Step 2 — Start the backend

```bash
# Terminal 1
cd backend-mock
npm start
# Initializes db.json from db.seed.json (if not present), then starts the mock API
# Running at http://localhost:4000
```

### Step 3 — Start the frontend

```bash
# Terminal 2
npm start
# App running at http://localhost:3000
```

Vite proxies all `/api` requests to `http://localhost:4000` — no environment file needed for local development.

### Test credentials

| Role  | Email            | Password   |
| ----- | ---------------- | ---------- |
| Admin | `admin@test.com` | `admin123` |
| User  | `user@test.com`  | `user123`  |

Admin sees CREATE, UPDATE and DELETE controls plus the Enrolled Students view. Regular users see the course catalogue and can enroll in courses.

### Resetting test data

If the database gets into a bad state during development:

```bash
cd backend-mock
npm run start:fresh   # resets db.json to seed data, then starts the server
```

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

# Coverage report
npm run test:coverage

# Type check
npm run typecheck

# Lint
npm run lint
npm run lint:fix

# Format (Prettier + import sorting)
npm run format
```

### Test coverage

```
Statements : 82%
Branches   : 66%
Functions  : 69%
Lines      : 82%
```

26 test files, 253 tests across all layers — store, components, helpers and custom hooks.

| Test file                                                      | What it covers                                                                                                    |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `store/courses/reducer.test.ts`                                | All reducer cases — createCourse, deleteCourse, updateCourse (including index not found branch), ?? null branches |
| `store/courses/thunk.test.ts`                                  | All four thunks — success, rejection, `successful: false`, non-Error fallback messages                            |
| `store/enrollments/reducer.test.ts`                            | Enrollments slice — all cases including append to existing                                                        |
| `store/enrollments/thunk.test.ts`                              | fetchEnrollments and enrollCourse — success, rejection, courseId passed to service                                |
| `store/enrollments/selectors.test.ts`                          | All four selectors including selectIsEnrolled true/false/empty                                                    |
| `store/user/reducer.test.ts`                                   | All 8 reducer cases — fetchUser, loginUser, logoutUser with ?? null branches                                      |
| `store/user/thunk.test.ts`                                     | All four thunks — fetchUser, loginUser, logoutUser, registerUser                                                  |
| `store/authors/reducer.test.ts`                                | All reducer cases — fetchAuthors and createAuthor                                                                 |
| `store/authors/thunk.test.ts`                                  | fetchAuthors and createAuthor through real store                                                                  |
| `helpers/formatCreationDate.test.ts`                           | Date formatting — zero-padded day/month, UTC safety, invalid input guard                                          |
| `helpers/isValidEmail.test.ts`                                 | Email validation — valid formats, edge cases, invalid inputs                                                      |
| `helpers/getCourseDuration.test.ts`                            | All branches — valid durations, N/A guard (null, undefined, NaN, negative), hour/hours label                      |
| `helpers/getAuthorNames.test.ts`                               | All branches — truncate option, null/undefined inputs, id-not-found filtering                                     |
| `hooks/useAppBootstrap.test.tsx`                               | fetchUser always fires, fetchCourses/Authors only when auth, fetchEnrollments only when admin, isBootstrapping    |
| `components/Header/Header.test.tsx`                            | Logo present, username displayed, Logout dispatched, navigation to /login                                         |
| `components/Courses/Courses.test.tsx`                          | Card count, loading state, navigation to /courses/add, admin button visibility                                    |
| `components/Courses/components/CourseCard/CourseCard.test.tsx` | Title, description, duration, authors, date, admin buttons, onDelete callback                                     |
| `components/Courses/components/SearchBar/SearchBar.test.tsx`   | handleChange, handleSubmit preventDefault                                                                         |
| `components/Courses/components/EmptyCourseList.test.tsx`       | Empty message, admin button with/without                                                                          |
| `components/CourseInfo/CourseInfo.test.tsx`                    | All 5 render paths — loading, error, not found, user with enroll, admin without enroll                            |
| `components/CourseForm/hooks/useCourseForm.test.tsx`           | Create/edit mode, register(), validation, submit success/failure, isSaving, author management                     |
| `components/Login/Login.test.tsx`                              | Form fields, submit button, register link                                                                         |
| `components/Registration/Registration.test.tsx`                | Form fields, submit button, login link                                                                            |
| `components/Enrolled/Enrolled.test.tsx`                        | All 4 render paths — loading, error, empty, data table                                                            |
| `components/Login/hooks/useLoginForm.test.tsx`                 | Validation, success navigation, safe redirect, server error                                                       |
| `components/Registration/hooks/useRegistrationForm.test.tsx`   | All field validations, success navigation, server error                                                           |
| `components/PrivateRoute/PrivateRoute.test.tsx`                | All 3 access paths — unauthenticated, non-admin with requireAdmin, authenticated admin                            |
| `common/Button/Button.test.tsx`                                | All 4 render paths — button, link, span (disabled+to), disabled button                                            |
| `common/ErrorMessage/ErrorMessage.test.tsx`                    | Message, onRetry button with/without                                                                              |
| `common/Input/Input.test.tsx`                                  | Value, placeholder, type, onChange, error message                                                                 |
| `common/ErrorBoundary/ErrorBoundary.test.tsx`                  | Normal render, default fallback, custom fallback, componentDidCatch, handleReset                                  |

**Approach:** `configureStore` with typed `preloadedState` — no `redux-mock-store`. Hook tests use `renderHook` from Testing Library. All test files colocated with their source.

---

## Security Notes

This project uses a JSON file (`db.json`) as its database and `json-server` as a backend mock — chosen for simplicity of deployment and demonstration, not for production use. Known limitations of this setup, and how they would be addressed in a production system:

| Limitation                                                         | Production approach                                                          |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Passwords stored in plaintext in `db.json`                         | `bcrypt` or `argon2` hashing; never store plaintext                          |
| Session tokens stored in `db.json` (no expiry, no revocation list) | Signed JWT with expiry, or server-side session store (Redis) with revocation |
| No Content Security Policy headers                                 | CSP, `X-Frame-Options`, `HSTS`, `Referrer-Policy` in Nginx config            |

### Supply chain security

Dependencies are managed with **Renovate** and **Socket.dev** as a two-layer supply chain defence:

**Renovate** (`minimumReleaseAge: 3 days`) — new package versions are not pulled automatically the moment they are published. Supply chain attacks (malicious npm publishes) are typically detected by the community within hours. A 3-day delay ensures the community has time to react before this repository adopts a potentially compromised version. Known CVEs bypass this delay entirely and trigger immediate PRs — a confirmed vulnerability has a different risk profile from an unknown supply chain attack.

**Socket.dev** — every PR that changes `package.json` or `package-lock.json` is scanned for suspicious changes in the new package version: unexpected network access, obfuscated code, new install scripts, new maintainers, dramatic size increases. A sophisticated attack that evades detection for 3 days would still be caught if the malicious code exhibits anomalous behaviour patterns that Socket flags.

Together they form complementary layers: Renovate provides temporal protection (time-based delay), Socket provides content-based protection (static analysis of the package itself).

### What is correctly implemented

- Auth cookie with `httpOnly: true` — JavaScript cannot access the session token
- `sameSite: 'lax'` — CSRF protection for cross-origin GET requests
- `secure: true` on auth cookie in production (`process.env.NODE_ENV === 'production'`)
- `withCredentials: true` on Axios — credentials included automatically
- Session tokens generated with `crypto.randomBytes(32).toString('hex')` — not predictable
- Rate limiting on `/login` and `/register` — 10 requests per 15 minutes via `express-rate-limit`
- `requireAuth` middleware on all protected endpoints — role checked server-side, not just client-side
- `requireAdmin` middleware on all write endpoints (create/update/delete courses and authors)
- Duplicate enrollment prevention — server returns 409 if user is already enrolled
- Role-based UI — admin controls absent from DOM, not just CSS-hidden
- `PrivateRoute` with `requireAdmin` — route-level access control on the client
- Unauthenticated users redirected to `/login?redirect=<path>` — original destination preserved for post-login navigation
- No `dangerouslySetInnerHTML` or `eval` anywhere in the codebase
- 401 interceptor — expired sessions redirect to login automatically; `/users/me` exempted (expected 401 during bootstrap)
- Open redirect protection in `useLoginForm` — `redirect` query param validated: must be relative, must not start with `//`, must not contain `://`
- API errors logged to console in development only (`import.meta.env.DEV`) — production errors should go to a monitoring service, not the browser console
- `ErrorBoundary` error detail (`error.message`) shown in development only — production users see a generic message
- `aria-disabled="true"` on disabled link-buttons (`Button` with `to` + `disabled`) — correct semantic for screen readers
- `isValidEmail` client-side validation before dispatching login/registration — reduces unnecessary API calls
- Branch protection on `master` — all PRs require passing CI (typecheck, lint, tests, build) before merge; force pushes blocked

---

## Project Structure

```
react-course-app/
├── src/
│   ├── common/
│   │   ├── Button/            # Renders <button>, <Link>, or <span> (disabled+to)
│   │   ├── ErrorBoundary/     # App-level error catch with reset
│   │   ├── ErrorMessage/
│   │   └── Input/
│   ├── components/
│   │   ├── CourseForm/
│   │   │   ├── hooks/
│   │   │   │   ├── useCourseForm.ts
│   │   │   │   └── useCourseForm.test.tsx
│   │   │   ├── components/
│   │   │   │   └── AuthorItem/
│   │   │   └── CourseForm.tsx
│   │   ├── CourseInfo/        # Detail view with enroll button
│   │   ├── Courses/
│   │   │   ├── components/
│   │   │   │   ├── CourseCard/
│   │   │   │   │   ├── CourseCard.tsx
│   │   │   │   │   └── CourseCard.test.tsx
│   │   │   │   ├── EmptyCourseList.tsx
│   │   │   │   └── SearchBar/
│   │   │   ├── Courses.tsx
│   │   │   └── Courses.test.tsx
│   │   ├── Enrolled/          # Admin — enrolled students view
│   │   ├── Header/
│   │   │   ├── components/
│   │   │   │   └── Logo/      # Logo component
│   │   │   ├── Header.tsx
│   │   │   └── Header.test.tsx
│   │   ├── Login/
│   │   │   ├── hooks/
│   │   │   │   ├── useLoginForm.ts
│   │   │   │   └── useLoginForm.test.tsx
│   │   │   └── Login.tsx
│   │   ├── PrivateRoute/
│   │   └── Registration/
│   │       ├── hooks/
│   │       │   ├── useRegistrationForm.ts
│   │       │   └── useRegistrationForm.test.tsx
│   │       └── Registration.tsx
│   ├── helpers/
│   │   ├── formatCreationDate.ts
│   │   ├── formatCreationDate.test.ts
│   │   ├── getAuthorNames.ts
│   │   ├── getAuthorNames.test.ts
│   │   ├── getCourseDuration.ts
│   │   ├── getCourseDuration.test.ts
│   │   ├── isValidEmail.ts
│   │   └── isValidEmail.test.ts
│   ├── hooks/
│   │   ├── useAppBootstrap.ts      # App-level data fetching sequence
│   │   └── useAppBootstrap.test.tsx
│   ├── store/
│   │   ├── user/
│   │   │   ├── reducer.ts
│   │   │   ├── reducer.test.ts
│   │   │   ├── selectors.ts
│   │   │   ├── thunk.ts
│   │   │   └── thunk.test.ts
│   │   ├── courses/
│   │   │   ├── reducer.ts
│   │   │   ├── reducer.test.ts
│   │   │   ├── selectors.ts
│   │   │   ├── thunk.ts
│   │   │   └── thunk.test.ts
│   │   ├── authors/
│   │   │   ├── reducer.ts
│   │   │   ├── reducer.test.ts
│   │   │   ├── selectors.ts
│   │   │   ├── thunk.ts
│   │   │   └── thunk.test.ts
│   │   ├── enrollments/
│   │   │   ├── reducer.ts
│   │   │   ├── reducer.test.ts
│   │   │   ├── selectors.ts
│   │   │   ├── selectors.test.ts
│   │   │   ├── thunk.ts
│   │   │   └── thunk.test.ts
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts           # UserRole, domain types, state interfaces, form types
│   ├── constants/
│   │   ├── index.ts
│   │   ├── validation.ts
│   │   └── ui.ts
│   ├── App.tsx
│   ├── App.css
│   ├── index.tsx
│   ├── index.css
│   ├── services.ts
│   ├── config.ts
│   └── setupTests.ts
├── backend-mock/
│   ├── server.js              # json-server with custom auth, HttpOnly cookie, rate limiting
│   └── db.json                # Seed data — users, courses, authors, enrollments
├── public/
├── .vscode/
│   └── settings.json          # formatOnSave, ESLint on save
├── .github/
│   ├── workflows/
│   │   └── ci.yml             # Parallel jobs: typecheck, lint, test+coverage, build+bundle size
├── .husky/
│   └── pre-commit             # typecheck → lint → test:ci (husky 9 format)
├── eslint.config.js           # ESLint 9 flat config — typescript-eslint, react-hooks, prettier
├── renovate.json              # Renovate config — minimumReleaseAge 3d, grouped PRs, automerge patches
├── index.html                 # Vite entry point
├── Dockerfile                 # Single-container: multi-stage builder + Express runtime
├── Dockerfile.multi-container # Multi-container: multi-stage builder + Nginx runtime
├── docker-compose.yml         # frontend (Nginx) + backend on private app-network
├── nginx.conf                 # SPA fallback, /api proxy to backend container, gzip
├── nginx.render.conf          # SPA fallback, /api proxy to localhost:3001, gzip
├── server-railway.js          # Express — serves React build + all /api routes
├── MIGRATION.md               # Dependency migration notes (React 18→19, RTK 1→2, ESLint 8→9)
├── .prettierrc.json           # singleQuote, printWidth 80, trivago import sorting
├── tsconfig.json              # strict, moduleResolution: bundler, target: ES2022
├── vite.config.ts             # Vite + Vitest — globals, jsdom, setupFiles, coverage thresholds
└── package.json               # type: module, ESM-native
```

---

## Deployment

Deployed on **Railway** as a single container. `server-railway.js` — Express serves the React build statically and mounts all API routes under `/api`.

**Live:** https://react-app-production-d055.up.railway.app

Auto-deploys on push to `master`. First load after inactivity takes 30–60 seconds on the Railway free tier.

---

## Author

**Łukasz Pławiak**

- GitHub: [github.com/lukaszplawiak](https://github.com/lukaszplawiak)
- LinkedIn: [linkedin.com/in/lukasz-p-dev](https://www.linkedin.com/in/lukasz-p-dev/)

---

MIT License
