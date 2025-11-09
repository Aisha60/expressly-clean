import { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";
import { X } from "lucide-react";

Chart.register(BarElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const getTip = (score, skill) => {
if (score >= 9) return "Excellent performance! Maintain consistency.";
if (score >= 7) return `Great job in ${skill}. Focus on refining subtleties.`;
if (score >= 5) return `You're making progress. Daily ${skill.toLowerCase()} practice can help.`;
if (score >= 3) return `Needs improvement. Try guided ${skill.toLowerCase()} sessions.`;
return `Start from basics in ${skill.toLowerCase()}. Consistency matters most.`;
};

const FeedbackSidebar = ({ selectedEntry, selectedSkill, onClose }) => (
<div className="fixed top-0 right-0 h-full w-full sm:w-[350px] bg-white shadow-lg border-l border-gray-200 p-6 z-50 overflow-y-auto transition-transform transform translate-x-0">
    <div className="flex justify-between items-center mb-4">
    <h3 className="text-xl font-bold text-indigo-700">Detailed Feedback</h3>
    <button onClick={onClose}>
        <X className="w-6 h-6 text-gray-600 hover:text-red-500 transition" />
    </button>
    </div>
    <p className="mb-1">
    <span className="font-semibold">Date:</span> {selectedEntry.date}
    </p>
    <p className="mb-4">
    <span className="font-semibold">Average Score:</span> {selectedEntry.score}/10
    </p>
    {selectedSkill === "Overall" ? (
    <div>
        <h4 className="font-semibold mb-2">Skill-wise Breakdown:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        {Object.entries(selectedEntry.skills).map(([skill, score]) => (
            <div key={skill} className="p-4 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
            <p>
                <span className="font-semibold">{skill}:</span> {score}/10
            </p>
            <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold">Tip:</span> {getTip(score, skill)}
            </p>
            </div>
        ))}
        </div>
    </div>
    ) : (
    <p>
        <span className="font-semibold">Tip:</span>{" "}
        {getTip(selectedEntry.score, selectedSkill)}
    </p>
    )}
</div>
);

const ProgressChart = ({ chartData = [], selectedSkill = "Overall" }) => {
    
const [selectedEntry, setSelectedEntry] = useState(null);

const data = {
    labels: chartData.map((entry) => entry.date),
    datasets: [
    {
        label: "Assessment Score",
        data: chartData.map((entry) => entry.score),
        backgroundColor: "rgba(79, 70, 229, 1)",
        borderRadius: 4,
        hoverBackgroundColor: "rgba(69, 70, 202, 0.7)",
    },
    ],
};

const options = {
    responsive: true,
    onClick: (evt, elements) => {
    if (elements.length > 0) {
        const index = elements[0].index;
        setSelectedEntry(chartData[index]);
    }
    },
    scales: {
    x: {
        ticks: { color: "#374151" },
        grid: { color: "rgba(0,0,0,0.05)" },
    },
    y: {
        beginAtZero: true,
        ticks: { color: "#374151", stepSize: 1 },
        grid: { color: "rgba(0,0,0,0.05)" },
    },
    },
    plugins: {
        legend: {
        labels: { color: "#1E293B" },
    },
    tooltip: {
        backgroundColor: "#1E293B",
        titleColor: "#fff",
        bodyColor: "#E5E7EB",
    },
    },
};

return (
    <div className="relative bg-white shadow-lg rounded-md p-6 max-w-4xl mx-auto min-h-[350px]">
    <h3 className="text-lg font-semibold text-indigo-600 mb-4">
        {selectedSkill} Skill Progress Over Time
    </h3>
    <Bar data={data} options={options} />
    <p className="text-sm text-gray-500 mt-2">Click on a bar to see detailed feedback.</p>

    {selectedEntry && (
        <FeedbackSidebar
        selectedEntry={selectedEntry}
        selectedSkill={selectedSkill}
        onClose={() => setSelectedEntry(null)}
        />
    )}
    </div>
);
};

export default ProgressChart;
