import dotenv from 'dotenv';
import express, { text } from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import {errorHandler} from './middleware/errorHandler.js';
import videoRoutes from './routes/videoRoutes.js';
import audioUploadRoutes from './routes/uploadRoutes.js';
import textAnalysisRoutes from './routes/textAnalysisRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
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
app.use('/api/upload', audioUploadRoutes);
app.use('/api/upload', videoRoutes);
app.use('/api', textAnalysisRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/practice', practiceRoutes);

// // Simple health endpoint for the Node API layer
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok' });
// });


// error handling middleware
app.use(errorHandler);


// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });