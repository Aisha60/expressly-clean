import { useState, useEffect } from 'react';
import { ArrowLeft, Target, Sparkles, Clock, BookOpen, CheckCircle, AlertCircle, Video, Mic, FileText, Zap, TrendingUp, User, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generate_PracticeTask } from '../utils/api';

export default function PracticeExercises() {
  const [selectedSkill, setSelectedSkill] = useState('');
  const [generatedTask, setGeneratedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [taskStatus, setTaskStatus] = useState(''); // 'not_started', 'generated', 'no_task_needed'

  const navigate = useNavigate();

  // Skill options
  const skillOptions = [
    {
      id: 'bodylanguage',
      name: 'Body Language',
      icon: User,
      description: 'Practice gestures, posture and facial expressions',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'speech',
      name: 'Speech',
      icon: Mic,
      description: 'Improve pronunciation, pace and tone',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'written',
      name: 'Written Communication',
      icon: FileText,
      description: 'Enhance writing clarity and structure',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200'
    }
  ];

  // Handle skill selection
  const handleSkillSelect = (skillId) => {
    setSelectedSkill(skillId);
    setGeneratedTask(null);
    setError('');
    setTaskStatus('not_started');
  };

  // Generate practice task
  const generatePracticeTask = async () => {
    if (!selectedSkill) {
      setError('Please select a skill first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await generate_PracticeTask(selectedSkill);

      if (response.success) {
        const mappedTask = mapGeminiTaskToFrontend(response.task, selectedSkill);
        setGeneratedTask(mappedTask);
        setTaskStatus('generated');
      }
      else {
        setError(response.error || 'Failed to generate practice task');
      }
    } catch (err) {
      console.error('Task generation error:', err);
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const mapGeminiTaskToFrontend = (geminiTask, moduleType) => {

    // Set static requirements based on module type
    let wordCount, recordingRequirement;

    if (moduleType === 'bodylanguage') {
      recordingRequirement = "Video recording: 10 seconds to 2 minutes";
    } else if (moduleType === 'speech') {
      recordingRequirement = "Audio recording: 10 seconds to 2 minutes";
    } else if (moduleType === 'written') {
      wordCount = "50-2000 words";
    }

    return {
      // Title and description
      title: geminiTask.task_title || geminiTask.title || "Practice Task",
      description: geminiTask.description || "Improve your communication skills",

      instructions: geminiTask.task_instruction || geminiTask.instructions ||
        "Follow the instructions to complete the practice task.",

      taskContent: geminiTask.task_content || geminiTask.taskContent,

      additionalNotes: geminiTask.additional_notes,

      focusArea: geminiTask.FocusArea || geminiTask.focusArea || "general",

      moduleType: moduleType,

      wordCount: wordCount,
      recordingRequirement: recordingRequirement,

      evaluationCriteria: [
        "Quality of execution",
        "Adherence to instructions",
        "Overall improvement"
      ]
    };
  };

  // Start practice task
  const startPracticeTask = () => {
    if (!generatedTask) return;

    const practiceTaskData = {
    ...generatedTask,
    moduleType: selectedSkill,
    isPractice: true,
    practiceStartedAt: new Date().toISOString(),
  };
  
    // Store task in localStorage for assessment module
    localStorage.setItem('currentPracticeTask', JSON.stringify(practiceTaskData));

    // Redirect to respective assessment module
    switch (generatedTask.moduleType || selectedSkill) {
      case 'bodylanguage':
        window.open('/recordVideo?practice=true',);
        break;
      case 'speech':
        window.open('/recordAudio?practice=true',);
        break;
      case 'written':
        window.open('/writeText?practice=true', );
        break;
      default:
        alert('Invalid task type');
    }
  };

  // Navigation
  const goToDashboard = () => {
    navigate('/dashboard');
  };

  // Get current skill details
  const getCurrentSkill = () => {
    return skillOptions.find(skill => skill.id === selectedSkill);
  };

  const currentSkill = getCurrentSkill();

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
              Back to Dashboard
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] bg-clip-text text-transparent">
                Practice Exercises
              </h1>
              <p className="text-gray-600 mt-2">
                Personalized practice tasks based on your assessment results
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Features Overview */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              AI-Powered Practice Sessions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get personalized practice tasks tailored to your specific improvement areas based on your latest assessments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 group hover:transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Personalized Tasks</h3>
              <p className="text-gray-600 text-sm">
                Practice tasks specifically designed for your weaknesses and improvement areas
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 group hover:transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Feedback</h3>
              <p className="text-gray-600 text-sm">
                Get immediate AI-powered feedback on your practice sessions
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 group hover:transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Progress Tracking</h3>
              <p className="text-gray-600 text-sm">
                Monitor your improvement over time with detailed progress insights
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Skill Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Target className="w-5 h-5 text-blue-500 mr-2" />
                Choose Skill to Practice
              </h2>

              <div className="space-y-4">
                {skillOptions.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => handleSkillSelect(skill.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left group ${selectedSkill === skill.id
                      ? `border-[#5B67CA] bg-gradient-to-r ${skill.bgColor} shadow-lg`
                      : 'border-gray-200 hover:border-[#5B67CA] hover:shadow-lg bg-white'
                      }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg mr-3 transition-all duration-200 ${selectedSkill === skill.id
                        ? `bg-gradient-to-r ${skill.color} shadow-lg`
                        : 'bg-gray-100 group-hover:bg-blue-100'
                        }`}>
                        <skill.icon className={`w-5 h-5 transition-colors ${selectedSkill === skill.id ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                          }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{skill.name}</h3>
                        <p className="text-sm text-gray-600">{skill.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Requirements */}
              <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center">
                  <BookOpen className="w-4 h-4 text-blue-500 mr-2" />
                  How it works:
                </h4>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    Select your desired skill
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                    Get AI-generated practice task
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                    Complete task in assessment module
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Receive instant feedback
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Task Generation Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              {!selectedSkill ? (
                // No skill selected state
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Select a Skill to Practice
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Choose one of the communication skills above to generate a personalized practice task based on your latest assessment results.
                  </p>
                </div>
              ) : generatedTask ? (
                // Task generated state
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{generatedTask.title}</h2>
                      <p className="text-gray-600 mt-1">{generatedTask.description}</p>
                    </div>
                  </div>


                  {/* Focus Area Badge */}
                  {generatedTask.focusArea && (
                    <div className="mb-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
                        <Target className="w-3 h-3 mr-1" />
                        Focus: {generatedTask.focusArea}
                      </span>
                    </div>
                  )}

                  {/* Task Details */}
                  <div className="space-y-6">
                    {/* Instructions */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <MessageCircle className="w-5 h-5 text-blue-500 mr-2" />
                        Instructions
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {generatedTask.instructions}
                      </p>
                    </div>

                    {/* Additional Notes (Pro Tips) */}
                    {generatedTask.additionalNotes && (
                      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <Sparkles className="w-5 h-5 text-cyan-500 mr-2" />
                          Pro Tips
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{generatedTask.additionalNotes}</p>
                      </div>
                    )}

                    {/* Task Content */}
                    {generatedTask.taskContent && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <FileText className="w-5 h-5 text-purple-500 mr-2" />
                          Practice Content
                        </h3>
                        <div className="bg-white/60 rounded-lg p-4 border border-purple-100">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {generatedTask.taskContent}
                          </p>
                        </div>
                        {generatedTask.wordCount && (
                          <div className="mt-3 text-sm text-purple-600 bg-purple-100/50 px-3 py-1 rounded-full inline-block">
                            Word Count: {generatedTask.wordCount}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Recording Requirements */}
                    {generatedTask.recordingRequirement && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                          {selectedSkill === 'bodylanguage' ? (
                            <Video className="w-5 h-5 text-green-500 mr-2" />
                          ) : (
                            <Mic className="w-5 h-5 text-green-500 mr-2" />
                          )}
                          Recording Requirements
                        </h3>
                        <p className="text-gray-700 font-medium">{generatedTask.recordingRequirement}</p>
                        <p className="text-gray-600 text-sm mt-2">
                          {selectedSkill === 'bodylanguage'
                            ? "Ensure good lighting and clear visibility of your upper body and hands."
                            : "Speak clearly and ensure good audio quality without background noise."
                          }
                        </p>
                      </div>
                    )}

                    {/* Evaluation Criteria*/}
                    {generatedTask.evaluationCriteria && (
                      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <Target className="w-5 h-5 text-amber-500 mr-2" />
                          How You'll Be Evaluated
                        </h3>
                        <ul className="space-y-2">
                          {generatedTask.evaluationCriteria.map((criterion, index) => (
                            <li key={index} className="flex items-start text-gray-700">
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span>{criterion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 mt-8">
                    <button
                      onClick={startPracticeTask}
                      className="flex-1 bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] text-white px-6 py-4 rounded-xl font-semibold hover:from-[#4a56b9] hover:to-[#7c3aed] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center group"
                    >
                      <Sparkles className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Start Practice Session
                    </button>
                    <button
                      onClick={() => {
                        setGeneratedTask(null);
                        setTaskStatus('not_started');
                      }}
                      className="px-6 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                    >
                      Generate New Task
                    </button>
                  </div>
                </div>
              ) : (
                // Ready to generate task state
                <div className="text-center py-12">
                  <div className={`w-20 h-20 bg-gradient-to-r ${currentSkill?.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <currentSkill.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Ready for {currentSkill?.name} Practice
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-8">
                    Click the button below to generate a personalized practice task based on your latest {currentSkill?.name.toLowerCase()} assessment results.
                  </p>

                  <button
                    onClick={generatePracticeTask}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] text-white px-8 py-4 rounded-xl font-semibold hover:from-[#4a56b9] hover:to-[#7c3aed] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group flex items-center mx-auto"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Generating Task...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Generate Practice Task
                      </div>
                    )}
                  </button>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-700 font-medium">{error}</p>
                    <p className="text-red-600 text-sm mt-1">Please try again or select a different skill</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}