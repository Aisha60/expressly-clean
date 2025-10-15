// // routes/textAnalysis.js
// const express = require('express');
// const router = express.Router();
// const { analyzeTextWithPython } = require('../services/textAnalysisService');

// router.post('/analyze/text', async (req, res) => {
//   try {
//     const { text, userId, source, fileName } = req.body;

//     // Validation
//     if (!text || !userId) {
//       return res.status(400).json({
//         error: 'Missing required fields',
//         message: 'Text and userId are required'
//       });
//     }

//     if (text.trim().split(/\s+/).length < 50) {
//       return res.status(400).json({
//         error: 'Insufficient text',
//         message: 'Please provide at least 50 words for analysis'
//       });
//     }

//     if (text.trim().split(/\s+/).length > 2000) {
//       return res.status(400).json({
//         error: 'Text too long',
//         message: 'Please limit text to 2000 words maximum'
//       });
//     }

//     // Call Python service for analysis
//     const analysisResult = await analyzeTextWithPython(text);

//     // Save to MongoDB (you'll implement this)
//     const savedAnalysis = await saveTextAnalysis({
//       userId,
//       text,
//       source,
//       fileName,
//       analysisResult,
//       createdAt: new Date()
//     });

//     res.json({
//       success: true,
//       result: analysisResult,
//       analysisId: savedAnalysis._id
//     });

//   } catch (error) {
//     console.error('Text analysis error:', error);
//     res.status(500).json({
//       error: 'Analysis failed',
//       message: error.message,
//       suggestion: 'Please try again with different text'
//     });
//   }
// });

// module.exports = router;

// routes/uploadRoutes.js
import express from 'express';
import multer from 'multer';
import { analyzeFile, analyzeText } from '../controllers/textControllers.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Use memory storage for faster processing

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log("Storage configured for multer in textAnalysisRoutes.js with file:", file);
        const allowedTypes = [
            'text/plain',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only TXT, PDF, and DOCX files are allowed.'), false);
        }
    }
});

// Analyze file (extract text + send to Python)
router.post("/analyze-file", upload.single('file'), analyzeFile);

// Analyze direct text (send to Python)
router.post("/analyze-text", analyzeText);

export default router;