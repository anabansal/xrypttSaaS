// import express from 'express';
// import session from 'express-session';
// import cors from 'cors';
// import bodyParser from 'body-parser';
// import { config,initializeConfig } from './config/index.js';
// import emailRoutes from './routes/emailRoutes.js';
// import walletRoutes from './routes/walletRoutes.js';
// import userRoutes from './routes/userRoutes.js'; // Import new user routes
// import trackingSystem from './services/walletMonitor.js';
// import authRoutes from './routes/authRoutes.js';
// import balanceRoutes from './routes/balance.js';
// import dotenv from 'dotenv';
// dotenv.config();
// await initializeConfig();

// // Initialize Express app
// const app = express();
// app.use(session({
//     secret: process.env.SESSION_SECRET || 'your-secret-key', // Use environment variable in production
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: process.env.NODE_ENV === 'production', // true in production
//       httpOnly: true,
//       maxAge: 24 * 60 * 60 * 1000 // 24 hours
//     }
//   }));
  
//   // CORS configuration - update to allow credentials
//   app.use(cors({
//     origin: process.env.NODE_ENV === 'production' 
//       ? 'https://xrypttsaas-1.onrender.com' 
//       : 'http://localhost:5173', // or whatever port your frontend runs on
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true,
//   }));
// // Parse JSON requests
// app.use(bodyParser.json());

// // Routes
// app.use('/api/balance', balanceRoutes);
// app.use('/api/emails', emailRoutes);
// app.use('/api/wallet', walletRoutes);
// app.use('/api/users', userRoutes); // Attach user routes
// app.use('/api/auth', authRoutes);
// // Health check route
// app.get('/', (req, res) => {
//    res.status(200).send('Backend is running successfully!');
// });

// // Global error handler
// app.use((err, req, res, next) => {
//    console.error('Unhandled Error:', err.message);
//    res.status(500).json({ error: 'Internal Server Error' });
// });

// // Start the server
// const PORT = config.port || 3000;

// async function startServer() {
//     try {
//         await trackingSystem.initializeTrackingOnStartup();

//         app.listen(PORT, () => {
//             console.log(`Server is running on http://localhost:${PORT}`);
//             console.log('Wallet tracking initialized successfully');
//         });
//     } catch (error) {
//         console.error('Failed to initialize wallet tracking:', error);
//         process.exit(1);
//     }
// }

// startServer();
