import express from "express";
import { generatePracticeTask } from "../controllers/practiceController.js";

const router = express.Router();

// POST /api/practice/generate-task
router.post("/generate-task", generatePracticeTask);

export default router;
