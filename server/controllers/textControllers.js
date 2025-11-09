
import PDFParser from 'pdf2json';
import mammoth from 'mammoth';
import axios from 'axios';
import TextResult from '../models/TextResult.js';

// Python service URL
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL;

// English validation without external dependencies
const isProperEnglish = (text) => {
    if (!text || text.trim().length === 0) return false;

    // Take a substantial sample for validation
    const sample = text.length > 1000 ? text.substring(0, 1000) : text;

    // Common English words for validation
    const commonEnglishWords = [
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
        'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
        'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
        'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
        'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
        'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
        'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
        'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
        'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
        'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
    ];

    // Count English words
    const words = sample.toLowerCase().match(/\b[a-z]+\b/g) || [];
    if (words.length === 0) return false;

    // Count common English words
    const englishWords = words.filter(word =>
        commonEnglishWords.includes(word) ||
        word.length > 2 // Consider longer words as likely English
    );

    const englishWordRatio = englishWords.length / words.length;

    // Check for non-English characters (excluding common punctuation)
    const nonEnglishChars = sample.match(/[^\x00-\x7F\s\.,!?;:'"()\-@#$%^&*\[\]{}]/g);

    console.log(`English validation - Total words: ${words.length}, English-like: ${englishWords.length}, Ratio: ${englishWordRatio.toFixed(2)}, Non-English chars: ${nonEnglishChars ? nonEnglishChars.length : 0}`);

    // Require 70% English-like words and minimal non-English characters
    return englishWordRatio > 0.70 && (!nonEnglishChars || nonEnglishChars.length < 10);
};

// Extract text from PDF using pdf2json
const extractTextFromPDF = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on('pdfParser_dataError', errData => {
            console.error('PDF parsing error:', errData.parserError);
            reject(new Error('Failed to parse PDF file'));
        });

        pdfParser.on('pdfParser_dataReady', pdfData => {
            try {
                const text = pdfParser.getRawTextContent();
                if (!text || text.trim().length === 0) {
                    reject(new Error('PDF appears to be empty or contains only images'));
                } else {
                    resolve(text);
                }
            } catch (error) {
                reject(new Error('Failed to extract text from PDF'));
            }
        });

        pdfParser.parseBuffer(fileBuffer);
    });
};

// Extract text from different file types
const extractTextFromFile = async (fileBuffer, mimeType) => {
    try {
        let extractedText = '';

        if (mimeType === 'text/plain') {
            // TXT file
            extractedText = fileBuffer.toString('utf8');
            console.log("TXT file extracted successfully");

        } else if (mimeType === 'application/pdf') {
            // PDF file using pdf2json
            extractedText = await extractTextFromPDF(fileBuffer);
            console.log("PDF extraction completed");

        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // DOCX file
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            extractedText = result.value;
            console.log("DOCX extraction completed");

            if (result.messages && result.messages.length > 0) {
                console.warn('DOCX extraction warnings:', result.messages);
            }
        }

        return extractedText;
    } catch (error) {
        console.error('Text extraction error:', error);
        throw new Error(`Failed to extract text: ${error.message}`);
    }
};

// Validate extracted text
const validateText = (text, fileName = 'text') => {
    if (!text || text.trim().length === 0) {
        return {
            isValid: false,
            error: "No text content found",
            suggestion: "The file appears to be empty or contain only images/non-text content."
        };
    }

    // Clean and normalize text
    const cleanText = text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\t/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const wordCount = cleanText.split(/\s+/).length;
    const charCount = cleanText.length;

    console.log(`Text validation - Words: ${wordCount}, Characters: ${charCount}`);

    // Check minimum word count
    if (wordCount < 50) {
        return {
            isValid: false,
            error: `Insufficient text content (${wordCount} words)`,
            suggestion: "Please provide at least 50 words of English text for meaningful analysis."
        };
    }

    // Check maximum word count
    if (wordCount > 2000) {
        return {
            isValid: false,
            error: `Text too long (${wordCount} words)`,
            suggestion: "Please limit your content to 2000 words maximum."
        };
    }

    // Validate English language
    if (!isProperEnglish(cleanText)) {
        return {
            isValid: false,
            error: "Text is not in proper English",
            suggestion: "Please provide content written in English only. Other languages are not supported."
        };
    }

    return {
        isValid: true,
        cleanText,
        wordCount,
        charCount
    };
};

// Send text to Python service for analysis
const sendToPythonService = async (text) => {
    try {
        const payload = {
            text: text
        };

        console.log('Sending to Python service at:', `${PYTHON_SERVICE_URL}/analyze_text`);

        const response = await axios.post(`${PYTHON_SERVICE_URL}/analyze-text`, payload, {
            timeout: 60000, // 1 minute timeout
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Python service response received');
        return response.data;
    } catch (error) {
        console.error('Python service error:', error);

        if (error.code === 'ECONNREFUSED') {
            throw new Error('Analysis service is currently unavailable');
        } else if (error.response?.data) {
            throw new Error(`Analysis failed: ${error.response.data.error || 'Unknown error'}`);
        } else {
            throw new Error('Failed to analyze text with AI service');
        }
    }
};

// Controller for file analysis
export const analyzeFile = async (req, res) => {
    try {
        console.log("Received file for analysis:", req.file ? req.file.originalname : "No file");
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "No file uploaded",
                suggestion: "Please select a file to upload."
            });
        }

        const { buffer, mimetype, originalname } = req.file;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is required",
                suggestion: "Please provide a valid user ID."
            });
        }

        console.log("Processing file:", originalname, "Type:", mimetype);

        // Extract text from file
        const extractedText = await extractTextFromFile(buffer, mimetype);

        // Validate extracted text
        const validation = validateText(extractedText, originalname);
        if (!validation.isValid) {
            console.log("Text validation failed:", validation);
            return res.status(400).json({
                success: false,
                error: validation.error,
                suggestion: validation.suggestion
            });
        }

        // Send to Python service for analysis
        const analysisResult = await sendToPythonService(validation.cleanText);

        console.log("Analysis result received from Python service:", analysisResult);

        // Prepare data for database
        const analysisData = {
            userId: userId,
            analysisType: 'file_upload',
            fileName: originalname,
            textMetadata: {
                wordCount: validation.wordCount,
                characterCount: validation.charCount,
                source: 'file_upload'
            },
            analysisResults: {
                overall_score: analysisResult.analysis?.overall_score || 0,
                quality_label: analysisResult.analysis?.quality_label || 'Unknown',
                categories: analysisResult.analysis?.categories || {}
            },
            suggestions: analysisResult.suggestions || [],
            key_improvement_areas: analysisResult.key_improvement_areas || []
        };

        // Save to database
        await TextResult.create(analysisData);

        console.log(`Analysis saved to database with ID: ${analysisData._id}`);

        // Return analysis results
        res.json({
            success: true,
            ...analysisResult,
            metadata: {
                fileName: originalname,
                wordCount: validation.wordCount,
                characterCount: validation.charCount,
                source: 'file_upload'
            }
        });

    } catch (error) {
        console.error("File analysis error:", error);

        let errorMessage = "Failed to process the file";
        let suggestion = "Please try with a different file or type text directly.";

        if (error.message.includes('password') || error.message.includes('encrypted')) {
            errorMessage = "File is password protected";
            suggestion = "Please provide an unprotected version of the file.";
        } else if (error.message.includes('corrupt') || error.message.includes('invalid')) {
            errorMessage = "File appears to be corrupted or invalid";
            suggestion = "Please try with a valid, uncorrupted file.";
        } else if (error.message.includes('image') || error.message.includes('scanned')) {
            errorMessage = "File contains only images or scanned pages";
            suggestion = "Please upload a file with selectable text, not scanned images.";
        } else if (error.message.includes('Analysis service')) {
            errorMessage = "Analysis service unavailable";
            suggestion = "Please try again in a few moments.";
        } else {
            errorMessage = error.message;
        }

        res.status(500).json({
            success: false,
            error: errorMessage,
            suggestion: suggestion
        });
    }
};

// Controller for direct text analysis
export const analyzeText = async (req, res) => {
    try {
        const { text, userId, source } = req.body;

        if (!text || !userId) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields",
                suggestion: "Text and user ID are required for analysis."
            });
        }

        console.log("Processing direct text analysis for user:", userId);

        // Validate text
        const validation = validateText(text);
        if (!validation.isValid) {
            console.log("Text validation failed:", validation.error);
            return res.status(400).json({
                success: false,
                error: validation.error,
                suggestion: validation.suggestion
            });
        }


        // Send to Python service for analysis
        const analysisResult = await sendToPythonService(validation.cleanText);

        console.log("Analysis result received from Python service:", analysisResult);

        // Prepare data for database
        const analysisData = {
            userId: userId,
            analysisType: 'text_upload',
            textMetadata: {
                wordCount: validation.wordCount,
                characterCount: validation.charCount,
                source: 'file_upload'
            },
            analysisResults: {
                overall_score: analysisResult.analysis?.overall_score || 0,
                quality_label: analysisResult.analysis?.quality_label || 'Unknown',
                categories: analysisResult.analysis?.categories || {}
            },
            suggestions: analysisResult.suggestions || [],
            key_improvement_areas: analysisResult.key_improvement_areas || []
        };

        // Save to database
        await TextResult.create(analysisData);

        // Return analysis results
        res.json({
            success: true,
            ...analysisResult,
            metadata: {
                wordCount: validation.wordCount,
                characterCount: validation.charCount,
                source: source || 'direct_input'
            }
        });

    } catch (error) {
        console.error("Text analysis error:", error);

        let errorMessage = "Failed to analyze text";
        let suggestion = "Please try again or check your text.";

        if (error.message.includes('Analysis service')) {
            errorMessage = "Analysis service unavailable";
            suggestion = "Please try again in a few moments.";
        } else {
            errorMessage = error.message;
        }

        res.status(500).json({
            success: false,
            error: errorMessage,
            suggestion: suggestion
        });
    }
};