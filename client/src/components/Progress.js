// import { useState, useMemo } from "react";
// import Sidebar from "./reusable/Sidebar";
// import Topbar from "./reusable/Topbar";
// import FilterBar from "./reusable/FilterBar";
// import StatusIndicator from "./reusable/StatusIndicator";
// import ProgressChart from "./reusable/ProgressChart";
// import { dummyData } from "./reusable/dummyProgressData";

// const Progress = () => {
// const [selectedSkill, setSelectedSkill] = useState("Overall");
// const [selectedRange, setSelectedRange] = useState("All time");

// const now = new Date();
// const filterDate = (dateStr) => {
//     const sessionDate = new Date(dateStr);
//     if (selectedRange === "last 7 days") {
//     const oneWeekAgo = new Date(now);
//     oneWeekAgo.setDate(now.getDate() - 7);
//     return sessionDate >= oneWeekAgo;
//     } else if (selectedRange === "last 30 days") {
//     const oneMonthAgo = new Date(now);
//     oneMonthAgo.setMonth(now.getMonth() - 1);
//     return sessionDate >= oneMonthAgo;
//     }
//     return true;
// };

// const chartData = useMemo(() => {
// const result = {};
// const skills = selectedSkill === "Overall" ? Object.keys(dummyData) : [selectedSkill];

// skills.forEach((skill) => {
//     dummyData[skill].forEach(({ score, date }) => {
//     if (!filterDate(date)) return;

//     if (!result[date]) {
//         result[date] = { total: 0, count: 0, skills: {} };
//     }
//     result[date].total += score;
//     result[date].count += 1;
//     result[date].skills[skill] = score;
//     });
// });

// return Object.keys(result)
//     .sort()
//     .map((date) => ({
//     date,
//     score: Math.round((result[date].total / result[date].count) * 10) / 10,
//     skills: result[date].skills,
//     }));
// }, [selectedSkill, selectedRange]);


// const trend = chartData.length > 1 && chartData[chartData.length - 1].score > chartData[0].score
//     ? "Improving"
//     : "Declining";

// return (
//     <div className="flex">
//     <Sidebar />
//     <div className="flex-1 p-6 bg-gray-50 min-h-screen">
//         <Topbar title="Progress Tracking" />
//         <FilterBar
//             selectedSkill={selectedSkill}
//             setSelectedSkill={setSelectedSkill}
//             selectedRange={selectedRange}
//             setSelectedRange={setSelectedRange}
//         />
//         <StatusIndicator trend={trend} />
//         <ProgressChart chartData={chartData} selectedSkill={selectedSkill} />
//     </div>
//     </div>
// );
// };

// export default Progress;


import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Target, Award, Activity } from "lucide-react";
import Sidebar from "./reusable/Sidebar";
import Topbar from "./reusable/Topbar";
import FilterBar from "./reusable/FilterBar";
import StatusIndicator from "./reusable/StatusIndicator";
import ProgressChart from "./reusable/ProgressChart";
import { dummyData } from "./reusable/dummyProgressData";

const Progress = () => {
  const [selectedSkill, setSelectedSkill] = useState("Overall");
  const [selectedRange, setSelectedRange] = useState("All time");

  const now = new Date();
  const filterDate = (dateStr) => {
    const sessionDate = new Date(dateStr);
    if (selectedRange === "last 7 days") {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      return sessionDate >= oneWeekAgo;
    } else if (selectedRange === "last 30 days") {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return sessionDate >= oneMonthAgo;
    }
    return true;
  };

  const chartData = useMemo(() => {
    const result = {};
    const skills = selectedSkill === "Overall" ? Object.keys(dummyData) : [selectedSkill];

    skills.forEach((skill) => {
      dummyData[skill].forEach(({ score, date }) => {
        if (!filterDate(date)) return;

        if (!result[date]) {
          result[date] = { total: 0, count: 0, skills: {} };
        }
        result[date].total += score;
        result[date].count += 1;
        result[date].skills[skill] = score;
      });
    });

    return Object.keys(result)
      .sort()
      .map((date) => ({
        date,
        score: Math.round((result[date].total / result[date].count) * 10) / 10,
        skills: result[date].skills,
      }));
  }, [selectedSkill, selectedRange]);

  const trend = chartData.length > 1 && chartData[chartData.length - 1].score > chartData[0].score
    ? "Improving"
    : "Declining";

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return { average: 0, highest: 0, sessions: 0 };
    
    const scores = chartData.map(d => d.score);
    return {
      average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10,
      highest: Math.max(...scores),
      sessions: chartData.length
    };
  }, [chartData]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Progress Tracking
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Monitor your improvement and track performance metrics
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Enhanced Filter Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
            <FilterBar
              selectedSkill={selectedSkill}
              setSelectedSkill={setSelectedSkill}
              selectedRange={selectedRange}
              setSelectedRange={setSelectedRange}
            />
          </div>

          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Average Score</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.average}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Highest Score</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.highest}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Practice Sessions</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.sessions}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Status Indicator */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
            <StatusIndicator trend={trend} />
          </div>

          {/* Enhanced Progress Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Performance Trend - {selectedSkill}
              </h2>
            </div>
            <ProgressChart chartData={chartData} selectedSkill={selectedSkill} />
          </div>

          {/* Additional Insights */}
          {chartData.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mt-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                  <h4 className="font-semibold text-indigo-800 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Current Trend
                  </h4>
                  <p className="text-indigo-700">
                    Your performance is currently <span className="font-semibold">{trend.toLowerCase()}</span>
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Recommendation
                  </h4>
                  <p className="text-green-700">
                    {trend === "Improving" 
                      ? "Keep up the great work! Continue practicing consistently."
                      : "Try focusing on specific areas for improvement in your next session."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Progress;