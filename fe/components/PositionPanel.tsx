"use client";

import React, { useState } from "react";
import { X, BarChart3, Grid3X3, MoreHorizontal, Briefcase } from "lucide-react";

export function PositionsPanel() {
  const [activeTab, setActiveTab] = useState<"open" | "pending" | "closed">(
    "open"
  );

  return (
    <div className="bg-[#2A3441] rounded-lg w-full p-4 h-[250px]">
      <div className="bg-[#2A3441] rounded-lg w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3A4854]">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab("open")}
              className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                activeTab === "open"
                  ? "text-white border-b-2 border-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                activeTab === "pending"
                  ? "text-white border-b-2 border-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab("closed")}
              className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                activeTab === "closed"
                  ? "text-white border-b-2 border-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Closed
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-[#3A4854] rounded transition-colors">
              <BarChart3 className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-[#3A4854] rounded transition-colors">
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-[#3A4854] rounded transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-[#3A4854] rounded transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className=" text-center">
          <div className="flex justify-center mb-4">
            <Briefcase className="w-16 h-16 text-gray-500" />
          </div>
          <p className="text-gray-400 text-lg">No open positions</p>
        </div>
      </div>
    </div>
  );
}
