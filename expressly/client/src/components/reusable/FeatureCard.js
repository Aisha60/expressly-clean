// Enhanced FeatureCard component
const FeatureCard = ({ icon, title, description, onClick, color }) => (
    <div
        onClick={onClick}
        className="cursor-pointer bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm hover:shadow-xl transition-all duration-300 group hover:transform hover:-translate-y-2"
    >
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color} w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <div className="text-white">
                {icon}
            </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
            {title}
        </h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className="mt-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm px-6 py-2 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
            Start Practice
        </button>
    </div>
);

export default FeatureCard;