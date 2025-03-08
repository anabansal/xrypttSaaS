import express from 'express';
import session from 'express-session';
import cors from 'cors';
import bodyParser from 'body-parser';
import { config, initializeConfig } from './config/index.js';
import emailRoutes from './routes/emailRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import userRoutes from './routes/userRoutes.js';
import trackingSystem from './services/walletMonitor.js';
import authRoutes from './routes/authRoutes.js';
import balanceRoutes from './routes/balance.js';
//import webhookRoutes from './routes/webhookRoutes.js';
import dotenv from 'dotenv';
import sitemapRouter from './routes/sitemap.js';
dotenv.config();
await initializeConfig();

const app = express();

// Configure session middleware before CORS and routes
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: true, // Changed to true to ensure session is saved on each request
    saveUninitialized: true, // Changed to true to ensure new sessions are saved
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Important for cross-site requests
    }
}));
  
// Configure CORS with proper settings for cookies
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
  ? ['https://www.xryptt.com', 'https://xrypttsaas-1.onrender.com', 'https://xryptt.com'] 
    : 'http://localhost:5173', // or whatever port your frontend runs on
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Important for cookies
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Session debug middleware (remove in production)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session Auth Data:', req.session.auth);
    next();
  });
}

// Routes
app.use('/api/balance', balanceRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
//app.use('/api/webhooks', webhookRoutes);

app.get('/', (req, res) => {
   res.status(200).send('Backend is running successfully!');
});

app.use('/', sitemapRouter);

app.use((err, req, res, next) => {
   console.error('Unhandled Error:', err.message);
   res.status(500).json({ error: 'Internal Server Error' });
});

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