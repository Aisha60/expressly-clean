import express from 'express';
import { getSessions, getSummary, getSessionById, getLeaderboard, getBadges } from '../controllers/progressController.js';

const router = express.Router();

// GET /api/progress/sessions?userId=...
router.get('/sessions', getSessions);

// GET /api/progress/summary?userId=...
router.get('/summary', getSummary);

// GET /api/progress/session/:type/:id
router.get('/session/:type/:id', getSessionById);

// GET /api/progress/leaderboard?type=overall|speech|video|text&days=7
router.get('/leaderboard', getLeaderboard);

// GET /api/progress/badges?userId=...
router.get('/badges', getBadges);

export default router;
