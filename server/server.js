const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Load env (override existing env variables, ensures this .env wins for local dev)
dotenv.config({ override: true });

// Connect to MongoDB
connectDB();

const app = express();

// ── CORS — allow all origins ──
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',   require('./routes/authRoutes'));
app.use('/api/trips',  require('./routes/tripRoutes'));
app.use('/api/places', require('./routes/placesRoutes'));

// Root
app.get('/', (req, res) => {
  res.json({ message: '🚀 WayGo API is running!' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'WayGo API is running 🚀',
    env: process.env.NODE_ENV,
    time: new Date().toISOString(),
  });
});

// Error middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 WayGo Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n⚠️ Port ${PORT} is already in use. Another process is listening on this port.`);
    console.error('   - If you are using nodemon, stop all instances and restart.');
    console.error('   - Windows: run `netstat -ano | findstr :${PORT}` then `taskkill /PID <pid> /F`.');
    console.error('   - macOS/Linux: run `lsof -i :${PORT}` then `kill -9 <pid>`.');
    process.exit(1);
  }
  console.error('Server error:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Graceful shutdown: SIGINT received');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Graceful shutdown: SIGTERM received');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});