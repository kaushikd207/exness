"use client";
import "./globals.css";
import LeftSidebar from "@/components/LeftSidebar";
import CandleChart from "@/components/CandleChart";
import RightPanel from "@/components/RightPanel";
import TradeForm from "@/components/TradeForm";

export default function HomePage() {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFmOGMwOWE3LTE1MjAtNDQ0OS05NTVjLTdlZWQyY2JhNTBkOCIsImVtYWlsIjoia2F1c2hpa2QyMDdAZ21haWwuY29tIiwiaWF0IjoxNzU2NTM5NzA4fQ.2ZnxDLrB8Vdc18lXgjW6aCQFDLAvfVoTWeQIRPAtCLQ";
  return (
    <div className="h-screen flex bg-[#141d22]">
      {/* Left Panel - Symbols */}
      <div className="w-1/5 border-r border-gray-300 bg-gray-900 text-white">
        <LeftSidebar />
      </div>

      {/* Center - Chart */}
      <div className="flex-1 p-4">
        <CandleChart />
      </div>

      {/* Right Panel - Orders */}
      <div className="w-1/4 border-l border-gray-300 bg-[#141d22]">
        <TradeForm token={token} />
      </div>
    </div>
  );
}
