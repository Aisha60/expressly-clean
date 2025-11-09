// Enhanced BadgeCard component
const BadgeCard = ({ badge }) => {
    const getBadgeStyle = () => {
        if (!badge.earned) return "bg-gray-100 text-gray-500 opacity-60 border-gray-300";

        switch (badge.level) {
            case "gold": return "bg-gradient-to-br from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300 shadow-lg";
            case "silver": return "bg-gradient-to-br from-gray-100 to-slate-100 text-gray-800 border-gray-300 shadow-md";
            case "bronze": return "bg-gradient-to-br from-orange-100 to-red-100 text-orange-800 border-orange-300 shadow-sm";
            default: return "bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-800 border-indigo-300";
        }
    };

    const getIconStyle = () => {
        if (!badge.earned) return "text-gray-400";
        
        switch (badge.level) {
            case "gold": return "text-yellow-600";
            case "silver": return "text-gray-600";
            case "bronze": return "text-orange-600";
            default: return "text-indigo-600";
        }
    };

    return (
        <div className={`rounded-2xl p-6 flex flex-col items-center justify-center border-2 transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-1 ${getBadgeStyle()}`}>
            <div className={`mb-4 p-4 rounded-xl bg-white/80 backdrop-blur-sm border ${!badge.earned ? 'border-gray-300' : 'border-white'} shadow-inner`}>
                <div className={getIconStyle()}>
                    {badge.icon}
                </div>
            </div>
            <h4 className="font-semibold text-lg mb-2 text-center">{badge.name}</h4>
            <p className="text-sm text-center mb-4 leading-relaxed">{badge.description}</p>
            {badge.earned ? (
                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                    ✓ Earned
                </span>
            ) : (
                <span className="px-4 py-2 rounded-full text-sm font-medium bg-gray-200 text-gray-600 border border-gray-300">
                    🔒 Locked
                </span>
            )}
        </div>
    );
};

export default BadgeCard;