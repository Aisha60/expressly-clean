
    const FilterBar = ({ selectedSkill, setSelectedSkill, selectedRange, setSelectedRange }) => {
    const skills = ["Overall", "Written", "Conversation", "Bodylanguage", "Speech"];
    const ranges = ["All time", "last 30 days", "last 7 days"];

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white shadow rounded-md mb-6">
        <div className="flex items-center gap-3 flex-wrap">
            {skills.map((skill) => (
            <button
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                selectedSkill === skill
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
            >
                {skill}
            </button>
            ))}
        </div>
        <div className="flex gap-3">
            {ranges.map((range) => (
            <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                selectedRange === range
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
            >
                {range}
            </button>
            ))}
        </div>
        </div>
    );
    };

    export default FilterBar;
