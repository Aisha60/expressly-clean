import { useState } from 'react';
import { ArrowLeft, Mic, Play, Pause, SkipForward, Star, ChevronRight } from 'lucide-react';

export default function PracticeSpeechExercise() {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [activeTab, setActiveTab] = useState('practice');

  // Sample exercise data based on user's weaknesses
  const exercises = [
    {
      id: 1,
      title: "Tone Matching Exercise",
      description: "Practice matching your emotional tone with content in persuasive speech segments.",
      duration: "5 min",
      difficulty: 2,
      category: "Tone Analysis",
      focused: true,
      steps: [
        "Listen to the example persuasive segment",
        "Record yourself delivering the same content",
        "Review the feedback on tone alignment",
        "Practice with adjusted emotional emphasis"
      ]
    },
    {
      id: 2,
      title: "Pitch Variation Drill",
      description: "Improve pitch changes to maintain audience engagement during longer speeches.",
      duration: "4 min",
      difficulty: 3,
      category: "Pitch Variation",
      focused: true,
      steps: [
        "Complete the reading with deliberate pitch changes",
        "Mark where you changed pitch on the transcript",
        "Listen to your recording for monotonous sections",
        "Practice maintaining pitch variation throughout"
      ]
    },
    {
      id: 3,
      title: "Pronunciation Enhancement",
      description: "Work on clearly articulating challenging word combinations and sounds.",
      duration: "3 min",
      difficulty: 1,
      category: "Pronunciation",
      focused: false,
      steps: [
        "Practice the tongue twisters provided",
        "Record your pronunciation of difficult words",
        "Listen to correct pronunciation examples",
        "Re-record with improved articulation"
      ]
    },
  ];

  // Handle starting an exercise
  const startExercise = (exercise) => {
    setSelectedExercise(exercise);
  };

  // Return to exercise list
  const backToExercises = () => {
    setSelectedExercise(null);
  };

  // Toggle recording state
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-56 bg-[#5B67CA] text-white">
        <div className="p-4">
          <h2 className="text-xl font-bold">Expressly</h2>
        </div>
        <nav className="mt-6">
          <SidebarLink active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</SidebarLink>
          <SidebarLink active={activeTab === 'history'} onClick={() => setActiveTab('history')}>History</SidebarLink>
          <SidebarLink active={activeTab === 'practice'} onClick={() => setActiveTab('practice')}>Practice</SidebarLink>
          <SidebarLink active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>Settings</SidebarLink>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {!selectedExercise ? (
            // Exercise list view
            <>
              <header className="bg-white shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-800">Practice Exercises</h1>
                <p className="text-gray-500 mt-1">
                  Personalized exercises based on your speech analysis
                </p>
              </header>
              
              <main className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Recommended For You</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exercises.filter(ex => ex.focused).map(exercise => (
                      <ExerciseCard 
                        key={exercise.id} 
                        exercise={exercise} 
                        onStart={() => startExercise(exercise)}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Other Exercises</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exercises.filter(ex => !ex.focused).map(exercise => (
                      <ExerciseCard 
                        key={exercise.id} 
                        exercise={exercise} 
                        onStart={() => startExercise(exercise)}
                      />
                    ))}
                  </div>
                </div>
              </main>
            </>
          ) : (
            // Individual exercise view
            <>
              <header className="bg-white shadow-sm p-6">
                <button 
                  onClick={backToExercises}
                  className="flex items-center text-[#5B67CA] hover:text-[#4a56b9] mb-4"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Back to exercises
                </button>
                <h1 className="text-2xl font-bold text-gray-800">{selectedExercise.title}</h1>
                <p className="text-gray-500 mt-1">{selectedExercise.category} • {selectedExercise.duration}</p>
              </header>
              
              <main className="p-6">
                {/* Exercise description */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">Exercise Description</h2>
                  <p className="text-gray-600 mb-4">{selectedExercise.description}</p>
                  
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Steps:</h3>
                  <ol className="list-decimal list-inside text-gray-600 pl-4 space-y-2">
                    {selectedExercise.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
                
                {/* Exercise content */}
                <div className="bg-[#D4D7F2] rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Practice Content</h2>
                  
                  {selectedExercise.category === "Tone Matching Exercise" ? (
                    <div className="p-4 bg-white rounded-md mb-4">
                      <p className="text-gray-800 italic">
                        "The decision you make today will determine your future. It's not just about choosing the 
                        convenient option, but about making the <strong>right</strong> choice for generations to come. 
                        We must act with conviction and purpose, knowing that our actions have consequences that extend 
                        far beyond ourselves."
                      </p>
                    </div>
                  ) : selectedExercise.category === "Pitch Variation" ? (
                    <div className="p-4 bg-white rounded-md mb-4">
                      <p className="text-gray-800 italic">
                        "The journey through the mountains was arduous. <span className="text-[#5B67CA]">(raise pitch)</span> The 
                        peaks seemed insurmountable at times, <span className="text-[#5B67CA]">(lower pitch)</span> but we persisted 
                        through storms and sunshine alike. <span className="text-[#5B67CA]">(neutral pitch)</span> When we finally 
                        reached the summit, <span className="text-[#5B67CA]">(gradually increase pitch)</span> the view was more 
                        magnificent than we could have ever imagined!"
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-white rounded-md mb-4">
                      <p className="text-gray-800 italic">
                        "She sells seashells by the seashore. The shells she sells are surely seashells.
                        So if she sells shells on the seashore, I'm sure she sells seashore shells."
                      </p>
                    </div>
                  )}
                  
                  {/* Recording controls */}
                  <div className="flex flex-col items-center">
                    <div className="w-full bg-white rounded-full h-2 mb-6">
                      <div className="bg-[#5B67CA] h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <button className="text-gray-500 hover:text-gray-700">
                        <Play size={24} />
                      </button>
                      <button 
                        onClick={toggleRecording}
                        className={`p-4 rounded-full ${isRecording ? 'bg-red-500' : 'bg-[#5B67CA]'} text-white`}
                      >
                        <Mic size={28} />
                      </button>
                      <button className="text-gray-500 hover:text-gray-700">
                        <SkipForward size={24} />
                      </button>
                    </div>
                    
                    <p className="mt-4 text-gray-600">
                      {isRecording ? "Recording... Click the mic to stop" : "Click the mic to start recording"}
                    </p>
                  </div>
                </div>
                
                {/* Tips section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">Tips for Success</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="text-[#5B67CA] mr-2 mt-0.5"><ChevronRight size={16} /></div>
                      <p className="text-gray-600">Focus on natural variations rather than forced changes</p>
                    </li>
                    <li className="flex items-start">
                      <div className="text-[#5B67CA] mr-2 mt-0.5"><ChevronRight size={16} /></div>
                      <p className="text-gray-600">Record multiple attempts and compare your improvement</p>
                    </li>
                    <li className="flex items-start">
                      <div className="text-[#5B67CA] mr-2 mt-0.5"><ChevronRight size={16} /></div>
                      <p className="text-gray-600">Listen to professional examples for inspiration</p>
                    </li>
                  </ul>
                </div>
              </main>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarLink({ children, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center w-full px-6 py-3 text-left ${
        active ? 'bg-[#4a56b9] font-medium' : 'hover:bg-[#4a56b9] transition-colors'
      }`}
    >
      {children}
    </button>
  );
}

function ExerciseCard({ exercise, onStart }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-[#D4D7F2] text-[#5B67CA] rounded">
            {exercise.category}
          </span>
          <div className="flex">
            {[...Array(exercise.difficulty)].map((_, i) => (
              <Star key={i} size={14} className="text-yellow-400" fill="#FBBF24" />
            ))}
            {[...Array(3 - exercise.difficulty)].map((_, i) => (
              <Star key={i + exercise.difficulty} size={14} className="text-gray-300" />
            ))}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{exercise.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{exercise.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">{exercise.duration}</span>
          <button 
            onClick={onStart}
            className="px-4 py-2 bg-[#5B67CA] hover:bg-[#4a56b9] text-white text-sm font-medium rounded-md"
          >
            Start Exercise
          </button>
        </div>
      </div>
    </div>
  );
}