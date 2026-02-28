# WayGo — Full Stack Travel Planner
## Complete Build Guide

---

## TECH STACK

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Maps | Google Maps Embed API (free) |
| State | React Context + useReducer |
| Styling | Tailwind CSS + custom CSS variables |
| Icons | Lucide React |
| HTTP | Axios |
| Dev Tools | Nodemon, concurrently, dotenv |

---

## PROJECT STRUCTURE

\`\`\`
waygo/
├── client/                          # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js             # Axios instance
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── planner/
│   │   │   │   ├── StepIndicator.jsx
│   │   │   │   ├── Step1Route.jsx
│   │   │   │   ├── Step2Transport.jsx
│   │   │   │   ├── Step3Costs.jsx
│   │   │   │   ├── Step4Places.jsx
│   │   │   │   └── Step5Summary.jsx
│   │   │   └── ui/
│   │   │       ├── Button.jsx
│   │   │       ├── Input.jsx
│   │   │       ├── Card.jsx
│   │   │       └── Badge.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── PlannerContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── usePlanner.js
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Planner.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TripDetail.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── utils/
│   │   │   ├── calculations.js
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Node.js Backend
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── tripController.js
│   │   └── placesController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Trip.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── tripRoutes.js
│   │   └── placesRoutes.js
│   ├── utils/
│   │   └── costCalculator.js
│   ├── .env
│   └── server.js
│
├── .gitignore
└── package.json                     # Root package for running both
\`\`\`

---

## STEP-BY-STEP BUILD INSTRUCTIONS

### PHASE 1: Setup

1. Create root folder: \`mkdir waygo && cd waygo\`
2. Create backend: \`mkdir server && cd server && npm init -y\`
3. Create frontend: \`cd .. && npm create vite@latest client -- --template react\`
4. Install root dev tools: \`npm init -y\` in root

### PHASE 2: Backend Setup
Install in /server: 
\`npm install express mongoose bcryptjs jsonwebtoken dotenv cors\`
\`npm install --save-dev nodemon\`

### PHASE 3: Frontend Setup
Install in /client:
\`npm install react-router-dom axios lucide-react\`
\`npm install -D tailwindcss postcss autoprefixer\`
\`npx tailwindcss init -p\`

### PHASE 4: Copy all files from this guide

### PHASE 5: Start both servers
From root: \`npm run dev\`

---

## ENVIRONMENT VARIABLES (server/.env)

\`\`\`
PORT=5000
MONGO_URI=mongodb://localhost:27017/waygo
JWT_SECRET=waygo_super_secret_key_2024
NODE_ENV=development
\`\`\`

---

## API ENDPOINTS

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/auth/me

### Trips
- GET    /api/trips              (all user trips)
- POST   /api/trips              (save new trip)
- GET    /api/trips/:id          (single trip)
- PUT    /api/trips/:id          (update trip)
- DELETE /api/trips/:id          (delete trip)

### Places
- GET /api/places/nearby?type=hotels&location=Delhi
- GET /api/places/fuel-price

---
