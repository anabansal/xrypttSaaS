import express from 'express';
import session from 'express-session';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createClient } from 'redis';
import * as connectRedis from 'connect-redis';
const RedisStore = connectRedis.default(session);
import { config, initializeConfig } from './config/index.js';
import emailRoutes from './routes/emailRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import userRoutes from './routes/userRoutes.js';
import trackingSystem from './services/walletMonitor.js';
import authRoutes from './routes/authRoutes.js';
import balanceRoutes from './routes/balance.js';
import dotenv from 'dotenv';
import sitemapRouter from './routes/sitemap.js';

dotenv.config();
await initializeConfig();

// Initialize Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  legacyMode: false,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

await redisClient.connect().catch(console.error);
console.log('Redis client connected');

// Initialize Redis store for sessions
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "xryptt:session:",
});

// Initialize Express app
const app = express();

// Configure session with Redis
app.use(session({
  store: redisStore,
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://www.xryptt.com', 'https://xrypttsaas-1.onrender.com', 'https://xryptt.com']
    : 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Parse JSON requests
app.use(bodyParser.json());

// Routes
app.use('/api/balance', balanceRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Health check route
app.get('/', (req, res) => {
  res.status(200).send('Backend is running successfully!');
});

app.use('/', sitemapRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
const PORT = config.port || 3000;

async function startServer() {
  try {
    await trackingSystem.initializeTrackingOnStartup();
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log('Wallet tracking initialized successfully');
    });
  } catch (error) {
    console.error('Failed to initialize wallet tracking:', error);
    process.exit(1);
  }
}

startServer();
const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

async function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    // Close Redis session store client
    console.log('Closing main Redis client...');
    await redisClient.quit();
    console.log('Main Redis client closed successfully');
    
    // Import and call OTP service shutdown 
    const otpService = await import('./services/otpService.js');
    await otpService.closeConnection();
    
    // Additional cleanup (if needed)
    // - Close database connections
    // - Cancel any pending tasks
    
    console.log('All connections closed. Shutting down...');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// Register shutdown handlers
signals.forEach(signal => {
  process.on(signal, () => gracefulShutdown(signal));
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});