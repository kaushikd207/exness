"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./globals.css";
import LeftSidebar from "@/components/LeftSidebar";
import CandleChart from "@/components/CandleChart";
import { NavigationHeader } from "@/components/NavigationHeader";
import { PositionsPanel } from "@/components/PositionPanel";
import TradeForm from "@/components/TradeForm";

export default function HomePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      router.push("/login"); // ✅ no token → redirect
    } else {
      setToken(savedToken);
    }
  }, [router]);

  if (!token) {
    return <div className="text-white">Redirecting to login...</div>;
  }

  return (
    <>
      <NavigationHeader />
      <div className="h-screen flex bg-[#141d22]">
        <div className="w-1/5 border-r border-gray-300 bg-gray-900 text-white">
          <LeftSidebar />
        </div>
        <div className="flex-1 p-10 flex flex-col gap-4">
          <CandleChart />
          <PositionsPanel />
        </div>
        <div className="w-1/4 border-l border-gray-300 bg-[#141d22]">
          <TradeForm token={token} />
        </div>
      </div>
    </>
  );
}
