// import React, { useState, useMemo } from "react";
// import { Trophy, UserCircle } from "lucide-react";
// import { useLocation } from "react-router-dom";
// import { dummyLeaderboard } from "./reusable/dummyLeaderboarddata";
// import Sidebar from "./reusable/Sidebar";

// const skillTypes = ["Overall", "Speech", "Body Language", "Written", "Conversation"];
// const dateRanges = ["All Time", "Last Week", "Last Month"];

// function isInDateRange(dateStr, range) {
// const date = new Date(dateStr);
// const now = new Date();
// const oneWeekAgo = new Date();
// oneWeekAgo.setDate(now.getDate() - 7);
// const oneMonthAgo = new Date();
// oneMonthAgo.setMonth(now.getMonth() - 1);
// if (range === "Last Week") return date >= oneWeekAgo;
// if (range === "Last Month") return date >= oneMonthAgo;
// return true;
// }

// function calculateRankings(users, skill, range) {
// return users
//     .map((user) => {
//     let total = 0;
//     const keys =
//         skill === "Overall"
//         ? ["speech", "bodylanguage", "written", "conversation"]: [skill.toLowerCase().replace(/ /g, "")];

//     keys.forEach((key) => {
//         user[key]?.forEach((s) => {
//         if (isInDateRange(s.date, range)) total += s.score;
//         });
//     });

//     return { username: user.username, score: total };
//     })
//     .filter((u) => u.score > 0)
//     .sort((a, b) => b.score - a.score)
//     .map((u, idx) => ({ ...u, rank: idx + 1 }));
// }

// const trophyColors = ["text-yellow-400", "text-gray-400", "text-orange-400"];

// export default function Leaderboard() {
//     const [selectedSkill, setSelectedSkill] = useState("Overall");
//     const [selectedRange, setSelectedRange] = useState("All Time");
//     const location = useLocation();

//     const rankings = useMemo(
//         () => calculateRankings(dummyLeaderboard, selectedSkill, selectedRange),
//         [selectedSkill, selectedRange]
//     );

//     return (
//         <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-white text-gray-800">
//         <Sidebar activePage="Leaderboard" />

//         <div className="flex-1 flex flex-col">
//             {/* Header */}
//             <header className="flex items-center justify-between px-8 py-5 bg-white shadow-md">
//             <h1 className="text-3xl font-bold text-indigo-700">Leaderboard</h1>
//             <UserCircle className="w-8 h-8 text-indigo-500" />
//             </header>

//             {/* Content */}
//             <main className="flex-1 p-8 overflow-y-auto">
//             {/* Filters */}
//             <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
//                 <h2 className="text-xl font-semibold text-indigo-700">
//                 🏆 {selectedRange} — {selectedSkill}
//                 </h2>
//                 <div className="flex gap-4">
//                 <select
//                     value={selectedSkill}
//                     onChange={(e) => setSelectedSkill(e.target.value)}
//                     className="px-4 py-2 rounded-md border text-gray-800 shadow-sm focus:ring-2 focus:ring-indigo-400"
//                 >
//                     {skillTypes.map((s) => (
//                     <option key={s}>{s}</option>
//                     ))}
//                 </select>
//                 <select
//                     value={selectedRange}
//                     onChange={(e) => setSelectedRange(e.target.value)}
//                     className="px-4 py-2 rounded-md border text-gray-800 shadow-sm focus:ring-2 focus:ring-indigo-400"
//                 >
//                     {dateRanges.map((r) => (
//                     <option key={r}>{r}</option>
//                     ))}
//                 </select>
//                 </div>
//             </div>

//             {/* Leaderboard */}
//             <div className="max-w-2xl mx-auto space-y-4">
//                 {rankings.length === 0 ? (
//                 <p className="text-center text-gray-500">No scores yet for this range.</p>
//                 ) : (
//                 rankings.map((user, index) => (
//                     <div
//                     key={user.username}
//                     className={`flex justify-between items-center px-6 py-4 rounded-lg shadow-md transition-all ${
//                         index < 3
//                         ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold"
//                         : "bg-white text-gray-800"
//                     }`}
//                     >
//                     <div className="flex items-center gap-4">
//                         {index < 3 ? (
//                         <Trophy className={`w-6 h-6 ${trophyColors[index]}`} />
//                         ) : (
//                         <span className="font-bold text-gray-500">{user.rank}</span>
//                         )}
//                         <span className="text-lg">{user.username}</span>
//                     </div>
//                     <span
//                         className={`text-lg ${
//                         index < 3 ? "text-white" : "text-indigo-600 font-semibold"
//                         }`}
//                     >
//                         {user.score}
//                     </span>
//                     </div>
//                 ))
//                 )}
//             </div>
//             </main>
//         </div>
//         </div>
//     );
// }


import React, { useState, useMemo } from "react";
import { Trophy, UserCircle, Crown, Medal, TrendingUp } from "lucide-react";
import { useLocation } from "react-router-dom";
import { dummyLeaderboard } from "./reusable/dummyLeaderboarddata";
import Sidebar from "./reusable/Sidebar";

const skillTypes = ["Overall", "Speech", "Body Language", "Written", "Conversation"];
const dateRanges = ["All Time", "Last Week", "Last Month"];

function isInDateRange(dateStr, range) {
    const date = new Date(dateStr);
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    if (range === "Last Week") return date >= oneWeekAgo;
    if (range === "Last Month") return date >= oneMonthAgo;
    return true;
}

function calculateRankings(users, skill, range) {
    return users
        .map((user) => {
            let total = 0;
            const keys =
                skill === "Overall"
                    ? ["speech", "bodylanguage", "written", "conversation"]
                    : [skill.toLowerCase().replace(/ /g, "")];

            keys.forEach((key) => {
                user[key]?.forEach((s) => {
                    if (isInDateRange(s.date, range)) total += s.score;
                });
            });

            return { username: user.username, score: total };
        })
        .filter((u) => u.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((u, idx) => ({ ...u, rank: idx + 1 }));
}

const trophyColors = ["text-yellow-400", "text-gray-400", "text-orange-400"];
const rankBackgrounds = [
    "bg-gradient-to-r from-yellow-400 to-amber-500",
    "bg-gradient-to-r from-gray-400 to-gray-500",
    "bg-gradient-to-r from-orange-400 to-red-500"
];

export default function Leaderboard() {
    const [selectedSkill, setSelectedSkill] = useState("Overall");
    const [selectedRange, setSelectedRange] = useState("All Time");
    const location = useLocation();

    const rankings = useMemo(
        () => calculateRankings(dummyLeaderboard, selectedSkill, selectedRange),
        [selectedSkill, selectedRange]
    );

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <Sidebar activePage="Leaderboard" />

            <div className="flex-1 flex flex-col">
                {/* Enhanced Header */}
                <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 p-6 flex items-center justify-between shadow-sm">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Leaderboard
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">
                            Compete with others and track your ranking progress
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-2 border border-gray-200">
                        <UserCircle className="w-8 h-8 text-indigo-500" />
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-800">Your Rank</p>
                            <p className="text-xs text-gray-500">See where you stand</p>
                        </div>
                    </div>
                </header>

                {/* Enhanced Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {/* Enhanced Filters */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500">
                                    <Crown className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {selectedRange} — {selectedSkill}
                                    </h2>
                                    <p className="text-gray-600 text-sm">
                                        {rankings.length} participants
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative">
                                    <select
                                        value={selectedSkill}
                                        onChange={(e) => setSelectedSkill(e.target.value)}
                                        className="appearance-none bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl py-3 pl-4 pr-10 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        {skillTypes.map((s) => (
                                            <option key={s}>{s}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="relative">
                                    <select
                                        value={selectedRange}
                                        onChange={(e) => setSelectedRange(e.target.value)}
                                        className="appearance-none bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl py-3 pl-4 pr-10 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        {dateRanges.map((r) => (
                                            <option key={r}>{r}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Leaderboard */}
                    <div className="max-w-4xl mx-auto">
                        {rankings.length === 0 ? (
                            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-white/20">
                                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Scores Yet</h3>
                                <p className="text-gray-500">
                                    Be the first to practice and appear on the leaderboard!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Top 3 Podium */}
                                {rankings.slice(0, 3).length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                        {rankings.slice(0, 3).map((user, index) => (
                                            <div
                                                key={user.username}
                                                className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 ${index === 0
                                                        ? 'border-yellow-400 md:order-2 md:transform md:scale-105'
                                                        : index === 1
                                                            ? 'border-gray-400 md:order-1'
                                                            : 'border-orange-400 md:order-3'
                                                    } transition-all duration-300 hover:shadow-2xl`}
                                            >
                                                <div className="flex flex-col items-center text-center">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${rankBackgrounds[index]
                                                        }`}>
                                                        {index === 0 ? (
                                                            <Crown className="w-6 h-6 text-white" />
                                                        ) : index === 1 ? (
                                                            <Medal className="w-6 h-6 text-white" />
                                                        ) : (
                                                            <Trophy className="w-6 h-6 text-white" />
                                                        )}
                                                    </div>
                                                    <div className={`text-2xl font-bold mb-2 ${index === 0 ? 'text-yellow-600' :
                                                            index === 1 ? 'text-gray-600' : 'text-orange-600'
                                                        }`}>
                                                        #{user.rank}
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                                        {user.username}
                                                    </h3>
                                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                                                        {user.score} pts
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Rest of the rankings */}
                                <div className="space-y-3">
                                    {rankings.slice(3).map((user, index) => (
                                        <div
                                            key={user.username}
                                            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20 hover:shadow-xl transition-all duration-300 group hover:border-indigo-200"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full group-hover:bg-indigo-50 transition-colors">
                                                        <span className="font-bold text-gray-600 group-hover:text-indigo-600">
                                                            {user.rank}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-lg font-medium text-gray-800 group-hover:text-indigo-700">
                                                            {user.username}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                                    <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                        {user.score} pts
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}