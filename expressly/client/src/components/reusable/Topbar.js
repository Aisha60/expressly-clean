import React from "react";

const Topbar = ({ title }) => {
  return (
    <div className="bg-indigo-100 shadow px-6 py-4 rounded-md mb-4">
      <h2 className="text-xl font-semibold text-indigo-700">{title}</h2>
    </div>
  );
};

export default Topbar;
