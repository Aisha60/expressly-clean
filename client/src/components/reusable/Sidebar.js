import React from "react";
import { LayoutDashboard, TrendingUp, LogOut, Users, Trophy } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
const navigate = useNavigate();
const location = useLocation();
const { logout } = useAuth();

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: TrendingUp, label: "Progress", path: "/dashboard/Progress" },
    { icon: Trophy, label: "Leaderboard", path: "/dashboard/leaderboard" },
    { icon: LogOut, label: "Logout", onClick: logout },
];

return (
    <div className="w-60 bg-gradient-to-b from-indigo-600 to-purple-700 text-white min-h-screen px-5 py-8 shadow-2xl border-r border-white/10">
      {/* Logo with icon */}
        <div className="flex items-center mb-10 ml-1">
        <Users className="w-8 h-8 mr-3 text-white filter drop-shadow-lg" />
        <h1 className="text-2xl font-bold tracking-wide bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
            Expressly
        </h1>
        </div>

      {/* Sidebar Items */}
    <ul className="space-y-3">
        {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            const handleClick = () => {
            if (item.label === "Logout" && item.onClick) {
                item.onClick();
            } else if (item.path) {
                navigate(item.path);
            }
        };

        return (
            <li
                key={item.label}
                onClick={handleClick}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl cursor-pointer transition-all duration-200 group ${
                isActive
                    ? "bg-white/20 backdrop-blur-md font-semibold shadow-lg border border-white/20"
                    : "hover:bg-white/10 hover:border hover:border-white/5"
                }`}
                >
            <item.icon className={`w-6 h-6 transition-transform duration-200 ${isActive ? "scale-110 text-cyan-200" : "group-hover:scale-105"}`} />
            <span className="tracking-wide text-lg">{item.label}</span>
            </li>
        );
        })}
    </ul>
    </div>
);
};

export default Sidebar;