import dotenv from 'dotenv';
import express, { text } from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import {errorHandler} from './middleware/errorHandler.js';
import uploadRoutes from './routes/videoRoutes.js';
import textAnalysisRoutes from './routes/textAnalysisRoutes.js';
import practiceRoutes from './routes/practice.js';

dotenv.config();
const app = express();


// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Parse JSON bodies
app.use(express.json());

// Ensure all responses are JSON
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', textAnalysisRoutes);
app.use('/api/practice', practiceRoutes);


// error handling middleware
app.use(errorHandler);


// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });