# 📚 React Course Management App

A full-stack web application for managing online courses, built with React and deployed using Docker. This project demonstrates modern web development practices including component architecture, state management, routing, and containerization.

## 🚀 Live Demo

[View Live Demo](https://react-app-production-d055.up.railway.app) 🎉
         !!!   First load after inactivity may take 30-60 seconds   !!!

Use these credentials to test the application:
**Admin Account:**
- Email: `admin@test.com`
- Password: `admin123`
**User Account:**
- Email: `user@test.com`
- Password: `user123`

## ✨ Features

- **User Authentication** - Login/Registration system with role-based access (Admin/User)
- **Course Management** - Create, read, update, and delete courses (CRUD operations)
- **Author Management** - Manage course authors with full CRUD functionality
- **Search & Filter** - Real-time course search by title or ID
- **Responsive Design** - Mobile-friendly interface with modern UI components
- **Role-Based Permissions** - Admin-only access to course modification features

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **PropTypes** - Runtime type checking

### Backend
- **JSON Server** - Mock REST API for development and demo

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Production web server with reverse proxy

### Code Quality
- **ESLint** - Code linting (Airbnb style guide)
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit checks

## 📋 Three Ways to Run the Application

Choose the method that best fits your needs:

| Method | Best For | Requirements | Setup Time |
|--------|----------|--------------|------------|
| **1. Development** | Daily coding, hot-reload | Node.js 18+ | ~5 min |
| **2. Docker Compose** | Production testing locally | Docker Desktop | ~3 min |
| **3. Live Demo** | Quick preview | Web browser only | 0 min |

---

## 🚀 Method 1: Local Development (npm start)

**Perfect for:** Daily development with instant hot-reload

### Prerequisites

```bash
# Required
- Node.js 18+ 
- npm 9+

# Check versions:
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

### Setup & Run

```bash
# 1. Clone repository
git clone https://github.com/yourusername/react-course-app.git
cd react-course-app

# 2. Install dependencies
npm install
cd backend-mock && npm install && cd ..

# 3. Create environment file
cat > .env.local << 'EOF'
REACT_APP_API_URL=http://localhost:4000
EOF

# 4. Start backend (Terminal 1)
cd backend-mock
npm start
# Backend runs on http://localhost:4000

# 5. Start frontend (Terminal 2 - new terminal window)
npm start
# Frontend runs on http://localhost:3000
```

### Access
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000

### Stop
Press `Ctrl+C` in both terminals

---

## 🐳 Method 2: Docker Compose (Production Architecture)

**Perfect for:** Testing production setup locally with Nginx + microservices

### Prerequisites

```bash
# Required
- Docker Desktop 20.10+
- Docker Compose v2.0+

# Check versions:
docker --version         # Should show 20.10.x or higher
docker compose version   # Should show v2.x.x or higher
```

**Node.js NOT required!** ✅ Everything runs in containers.

### Setup & Run

```bash
# 1. Clone repository
git clone https://github.com/yourusername/react-course-app.git
cd react-course-app

# 2. Start with Docker Compose
docker compose up --build

# Wait ~2-3 minutes for first build
# You'll see:
# ✔ Container react-app-backend   Started
# ✔ Container react-app-frontend  Started
```

### Access
- **Frontend:** http://localhost
- **Backend:** Private (only accessible via Nginx proxy)

### Architecture
```
Browser → Nginx (port 80) → Backend (port 4000, private)
```

### Stop
```bash
# Press Ctrl+C or run:
docker compose down
```

---

## ☁️ Method 3: Live Demo (Railway Cloud)

**Perfect for:** Sharing with recruiters, no installation needed!

### Prerequisites

**Nothing!** Just a web browser. ✅

### Access

Simply open: **[https://react-app-production-d055.up.railway.app](https://react-app-production-d055.up.railway.app)**

**Note:** First load after inactivity may take 30-60 seconds (Railway free tier limitation)

---

## 👤 Test Credentials

Use these credentials to test the application:

**Admin Account:**
- Email: `admin@test.com`
- Password: `admin123`

**User Account:**
- Email: `user@test.com`
- Password: `user123`

---

## 📝 Quick Reference

```bash
# Method 1: Local Development
cd backend-mock && npm start  # Terminal 1
npm start                     # Terminal 2

# Method 2: Docker Compose
docker compose up --build     # One command!

# Method 3: Live Demo
# Just open: https://react-app-production-d055.up.railway.app
```

---

## 📁 Project Structure

```
react-course-app/
├── src/
│   ├── components/         # React components
│   │   ├── CourseForm/     # Course creation/edit form
│   │   ├── Courses/        # Course list and search
│   │   ├── Header/         # Navigation header
│   │   ├── Login/          # Login page
│   │   └── Registration/   # Registration page
│   ├── store/              # Redux store configuration
│   │   ├── courses/        # Courses state management
│   │   ├── authors/        # Authors state management
│   │   └── user/           # User authentication state
│   ├── common/             # Reusable components (Button, Input)
│   ├── services.js         # API service layer
│   └── config.js           # App configuration
├── backend-mock/           # Mock API server
│   ├── server.js           # JSON Server configuration
│   └── db.json             # Mock database
├── public/                 # Static assets
├── Dockerfile              # Frontend container config
├── docker-compose.yml      # Multi-container setup
├── nginx.conf              # Nginx configuration
└── package.json            # Dependencies
```

## 🐳 Docker Architecture

The application uses a multi-container architecture:

- **Frontend Container** (Nginx + React build)
  - Serves optimized production build
  - Reverse proxy to backend API
  - Port: 80

- **Backend Container** (Node.js + JSON Server)
  - REST API endpoints
  - Private network (not exposed publicly)
  - Port: 4000 (internal only)

## 🔒 Security Features

- **Private Backend** - API not directly accessible from internet
- **Nginx Reverse Proxy** - All requests routed through frontend
- **Token-based Authentication** - JWT-style token management
- **Role-based Access Control** - Admin/User permissions

## 🎨 Key Features Implementation

### State Management (Redux)
- Centralized state with Redux Toolkit
- Async operations with Redux Thunks
- Separate slices for courses, authors, and user

### Routing (React Router)
- Protected routes with authentication guard
- Dynamic routing for course details
- Programmatic navigation

### Component Architecture
- Reusable UI components (Button, Input)
- Container/Presentational component pattern
- PropTypes for type safety

### API Integration
- Axios for HTTP requests
- Service layer abstraction
- Environment-based API URL configuration

## 📝 Available Scripts

```bash
# Development
npm start              # Start dev server
npm test               # Run tests
npm run lint           # Lint code
npm run lint:fix       # Fix linting issues
npm run format         # Format code with Prettier

# Production
npm run build          # Build for production

# Docker
docker compose up      # Start containers
docker compose down    # Stop containers
docker compose logs    # View logs
```

## 🚢 Deployment

This application is deployed on **Railway** and uses Docker for containerization.

### Current Deployment
- **Platform:** Railway.app
- **Live URL:** https://react-app-production-d055.up.railway.app
- **Auto-deploy:** Enabled (deploys automatically on git push)

### Deploy Your Own

The application is ready for deployment to any Docker-compatible platform:

**Recommended Platforms:**
- **Railway.app** ⭐ (Current) - Free tier, auto-deploy from GitHub
- **Render.com** - Free tier with auto-sleep after 15min inactivity
- **Fly.io** - Free tier with 3 VMs
- **Google Cloud Run** - Pay-per-use, generous free tier
- **AWS ECS/Fargate** - Enterprise-grade, more complex setup

### Railway Deployment Steps
1. Push your code to GitHub
2. Connect GitHub account to Railway.app
3. Create new project from your repository
4. Railway auto-detects `Dockerfile`
5. Click "Deploy"
6. Generate public domain in Settings → Networking

**That's it!** Railway handles everything automatically. 🚀

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Your Name**
- GitHub: https://github.com/lukaszplawiak
- LinkedIn: https://www.linkedin.com/in/lukasz-p-dev/

## 🙏 Acknowledgments

- React documentation and community
- Docker documentation
- Redux Toolkit team

---

## 🐛 Troubleshooting

### Port already in use (Method 1)
```bash
# Find process using the port
lsof -i :3000  # or :4000
# Kill the process
kill -9 <PID>
```

### Docker won't start (Method 2)
```bash
# Restart Docker Desktop
# macOS/Windows: Open Docker Desktop app → Restart
# Linux:
sudo systemctl restart docker
```

### Module not found
```bash
# Reinstall dependencies
npm install
cd backend-mock && npm install
```

### Railway app sleeping (Method 3)
- First load after inactivity takes 30-60s
- This is normal for Railway free tier
- Subsequent loads are instant

---

⭐ **If you found this project helpful, please give it a star!**
