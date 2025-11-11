import { useState, useRef, useEffect } from 'react';
import { PenTool, FileText, ArrowLeft, Upload, AlertCircle, CheckCircle, X, SpellCheck, FileCheck, Zap, TrendingUp, BookOpen, Target, Sparkles, MessageCircle, Edit3, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { submitTextAnalysis, submitFileAnalysis } from '../utils/api.js';

export default function WrittenCommunicationInput() {
  const [inputMode, setInputMode] = useState('text');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [practiceTask, setPracticeTask] = useState(null);
  const [supportedFiles] = useState(['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const isPracticeMode = new URLSearchParams(window.location.search).get('practice') === 'true';

  useEffect(() => {
    const words = textInput.trim() ? textInput.trim().split(/\s+/).length : 0;
    const chars = textInput.length;
    setWordCount(words);
    setCharCount(chars);
  }, [textInput]);

  // Load practice task if in practice mode
  useEffect(() => {
    if (isPracticeMode) {
      const storedTask = localStorage.getItem('currentPracticeTask');
      if (storedTask) {
        const task = JSON.parse(storedTask);
        setPracticeTask(task);
        console.log("Loaded practice task:", task);
        
        setTextInput('');
        
        setInputMode('text');
      }
    }
  }, [isPracticeMode]);

  
  const copyPracticeContent = () => {
    if (practiceTask?.taskContent) {
      navigator.clipboard.writeText(practiceTask.taskContent);
      alert('Practice content copied to clipboard!');
    }
  };


  const handleFileChange = async (e) => {
    if (isPracticeMode) return; 

    const file = e.target.files[0];
    if (!file) return;

    setValidationError('');
    setFileName('');
    setSelectedFile(null);

    // File type validation
    if (!supportedFiles.includes(file.type)) {
      setValidationError('Please upload only TXT, or DOCX files.');
      return;
    }

    // File size validation (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setValidationError('File size must be less than 5MB.');
      return;
    }

    setFileName(file.name);
    setSelectedFile(file);
  };

  // Validate text input before submission
  const validateTextInput = () => {
    if (!textInput.trim()) {
      return 'Please enter text for analysis.';
    }

    const words = textInput.trim().split(/\s+/).length;
    if (words < 50) {
      return 'Please provide at least 50 words for meaningful analysis.';
    }

    if (words > 2000) {
      return 'Text is too long. Please limit to 2000 words maximum.';
    }

    return null;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setValidationError('');

    try {
      let result;
      console.log('Submitting for analysis:', { 
        inputMode, 
        textInput, 
        fileName, 
        selectedFile,
        isPracticeMode 
      });

      if (inputMode === 'text') {
        // Validate text input
        const error = validateTextInput();
        if (error) {
          setValidationError(error);
          setIsLoading(false);
          return;
        }

        // Submit text for analysis
        result = await submitTextAnalysis({
          text: textInput,
          source: 'direct_input',
        });
      } else {
        
        if (!selectedFile) {
          console.log("No file selected:", { fileName, selectedFile });
          setValidationError('Please select a file to upload.');
          setIsLoading(false);
          return;
        }

        console.log("Submitting file:", selectedFile.name, selectedFile.type, selectedFile.size);
        result = await submitFileAnalysis(selectedFile);
      }

      // Navigate to results page
      navigate('/feedbackText', { 
        state: { 
          analysisResult: result,
          text: inputMode === 'text' ? textInput : undefined,
          source: inputMode === 'text' ? 'direct_input' : 'file_upload',
          fileName: inputMode === 'file' ? fileName : null,
          practiceTask: practiceTask
        }
      });
    } catch (error) {
      console.error('Analysis error:', error);
      setValidationError(error.message || 'Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear file input
  const clearFileInput = () => {
    if (isPracticeMode) return; 
    
    setFileName('');
    setSelectedFile(null);
    setValidationError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Navigation
  const goToDashboard = () => {
    if (isPracticeMode) {
      // Go back to practice exercises page
      navigate('/practiceExercises');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={goToDashboard}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4 group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              {isPracticeMode ? 'Back to Practice' : 'Back to Dashboard'}
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] bg-clip-text text-transparent">
                {isPracticeMode ? 'Writing Practice Session' : 'Written Communication Analysis'}
              </h1>
              <p className="text-gray-600 mt-2">
                {isPracticeMode ? 'Complete your writing practice task' : 'Improve your writing with AI-powered feedback'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Features Overview*/}
        {!isPracticeMode && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Comprehensive Writing Analysis
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get detailed feedback on your writing with our AI-powered analysis covering all aspects of effective communication
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 group hover:transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <SpellCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Grammar & Spelling</h3>
                <p className="text-gray-600 text-sm">
                  Identify and correct grammatical errors, spelling mistakes, and punctuation issues
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 group hover:transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Sentence Structure</h3>
                <p className="text-gray-600 text-sm">
                  Analyze sentence complexity and structure for better readability and flow
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 group hover:transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Word Choice</h3>
                <p className="text-gray-600 text-sm">
                  Evaluate vocabulary usage and suggest improvements for clarity and impact
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 group hover:transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Coherence & Flow</h3>
                <p className="text-gray-600 text-sm">
                  Assess how well ideas connect and flow throughout your writing
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Instructions & Practice Task */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 sticky top-8">
              
              {isPracticeMode && practiceTask ? (
                // Practice Task Instructions
                <>
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 mb-6 text-white">
                    <h2 className="text-xl font-bold mb-2 flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Practice Task
                    </h2>
                    <p className="text-purple-100 text-sm">
                      Complete this exercise to improve your writing skills
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-800 text-lg mb-3 border-l-4 border-blue-500 pl-3">
                      {practiceTask.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 bg-blue-50 p-3 rounded-lg">
                      {practiceTask.description}
                    </p>
                    
                    {/* Instructions */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border-2 border-blue-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-blue-700">
                        <MessageCircle className="w-5 h-5 text-blue-500 mr-2" />
                        Your Task:
                      </h4>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                        {practiceTask.instructions}
                      </p>
                    </div>

                    {/* Pro Tips */}
                    {practiceTask.additionalNotes && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center text-green-700">
                          <Sparkles className="w-5 h-5 text-green-500 mr-2" />
                          Pro Tips:
                        </h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {practiceTask.additionalNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Regular Assessment Instructions
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <Target className="w-5 h-5 text-blue-500 mr-2" />
                    Choose Input Method
                  </h2>
                  <div className="space-y-4">
                    <button
                      onClick={() => setInputMode('text')}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                        inputMode === 'text' 
                          ? 'border-[#5B67CA] bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg' 
                          : 'border-gray-200 hover:border-[#5B67CA] hover:shadow-lg bg-white'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`p-3 rounded-lg mr-3 transition-all duration-200 ${
                          inputMode === 'text' ? 'bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] shadow-lg' : 'bg-gray-100 group-hover:bg-blue-100'
                        }`}>
                          <PenTool className={`w-5 h-5 transition-colors ${
                            inputMode === 'text' ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Write Directly</h3>
                          <p className="text-sm text-gray-600">Type or paste your text</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setInputMode('file')}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                        inputMode === 'file' 
                          ? 'border-[#5B67CA] bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg' 
                          : 'border-gray-200 hover:border-[#5B67CA] hover:shadow-lg bg-white'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`p-3 rounded-lg mr-3 transition-all duration-200 ${
                          inputMode === 'file' ? 'bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] shadow-lg' : 'bg-gray-100 group-hover:bg-blue-100'
                        }`}>
                          <Upload className={`w-5 h-5 transition-colors ${
                            inputMode === 'file' ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Upload File</h3>
                          <p className="text-sm text-gray-600">TXT, or DOCX</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </>
              )}

              {/* Requirements */}
              <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center">
                  <BookOpen className="w-4 h-4 text-blue-500 mr-2" />
                  {isPracticeMode ? 'Practice Requirements:' : 'Requirements:'}
                </h4>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    English language only
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                    {isPracticeMode ? '50-2000 words' : '50-2000 words'}
                  </li>
                  {!isPracticeMode && (
                    <>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                        Maximum file size: 5MB
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                        Supported: TXT, DOCX
                      </li>
                    </>
                  )}
                  {isPracticeMode && (
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                      Text input only (file upload disabled)
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Side - Input Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              {inputMode === 'text' || isPracticeMode ? (
              
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                      <Edit3 className="w-6 h-6 text-blue-500 mr-2" />
                      {isPracticeMode ? 'Your Writing Response' : 'Enter Your Text'}
                    </h2>
                    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {wordCount} words • {charCount} characters
                    </div>
                  </div>

                  {/* Practice Content Box*/}
                  {isPracticeMode && practiceTask?.taskContent && (
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-800 flex items-center">
                          <FileText className="w-5 h-5 text-purple-500 mr-2" />
                          Practice Content:
                        </h3>
                        <button
                          onClick={copyPracticeContent}
                          className="flex items-center text-sm text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </button>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 max-h-48 overflow-y-auto">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                          {practiceTask.taskContent}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Use the content above for rewriting, correction, or improvement
                      </p>
                    </div>
                  )}

                  {/* User's Typing Area */}
                  <div className={isPracticeMode && practiceTask?.taskContent ? "mt-6" : ""}>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <PenTool className="w-5 h-5 text-green-500 mr-2" />
                      Your Response:
                    </h3>
                    <textarea
                      rows={10}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={
                        isPracticeMode 
                          ? "Type your response here... (Minimum 50 words required)"
                          : "Type or paste your text here... (Minimum 50 words required for analysis)"
                      }
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none bg-white/80 shadow-sm"
                    />
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm">
                        {wordCount < 50 ? (
                          <span className="text-orange-600 flex items-center bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {50 - wordCount} more words needed
                          </span>
                        ) : (
                          <span className="text-green-600 flex items-center bg-green-50 px-3 py-1 rounded-full border border-green-200">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Ready for analysis
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                        Limit: 2000 words
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // File Upload Area
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Document</h2>
                  
                  {!fileName ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#5B67CA] transition-colors duration-200 bg-gradient-to-br from-gray-50 to-blue-50">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2 font-medium">Upload TXT or DOCX file</p>
                      <p className="text-sm text-gray-500 mb-6">Maximum file size: 5MB</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.pdf,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] text-white px-8 py-3 rounded-xl font-semibold hover:from-[#4a56b9] hover:to-[#7c3aed] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        Choose File
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                          <div>
                            <span className="font-semibold text-green-800 text-lg">File Ready</span>
                            <p className="text-green-700 text-sm">{fileName}</p>
                          </div>
                        </div>
                        <button
                          onClick={clearFileInput}
                          className="text-gray-500 hover:text-gray-700 p-2 hover:bg-white rounded-xl transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-sm text-green-600 bg-green-100/50 px-3 py-2 rounded-lg">
                        File selected and ready for analysis
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Validation Error */}
              {validationError && (
                <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-700 font-medium">{validationError}</p>
                    <p className="text-red-600 text-sm mt-1">Please check the requirements and try again</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || 
                    (inputMode === 'text' && wordCount < 50) || 
                    (inputMode === 'file' && !selectedFile && !isPracticeMode)}
                  className="bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] text-white px-10 py-4 rounded-xl font-bold hover:from-[#4a56b9] hover:to-[#7c3aed] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group flex items-center text-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      {isPracticeMode ? 'Analyzing Practice...' : 'Analyzing Writing...'}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Sparkles className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                      {isPracticeMode ? 'Submit Practice Task' : 'Analyze Writing'}
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}