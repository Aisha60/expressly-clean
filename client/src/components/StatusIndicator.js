import React from "react";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

const StatusIndicator = ({ trend }) => {
  const isImproving = trend === "Improving";

  return (
    <div className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-4">
      {isImproving ? (
        <ArrowUpCircle className="text-green-600" />
      ) : (
        <ArrowDownCircle className="text-red-600" />
      )}
      <span>{trend} Progress</span>
    </div>
  );
};

export default StatusIndicator;
