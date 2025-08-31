"use client";

import React, { useEffect, useState } from "react";
import { Settings, User, Clock, Grid3X3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBalanceStore } from "@/store";
export function NavigationHeader() {
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const bal = useBalanceStore((state: any) => state.updateBalance);
  const userBal = useBalanceStore((state: any) => state.bal);
  // ✅ Fetch balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }
        const res = await fetch("http://localhost:4000/api/v1/user/balance", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch balance");
        const data = await res.json();
        setBalance(data?.usd_balance);
        bal(data?.usd_balance);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBalance();
  }, [router]);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <header className="bg-[#0F1419] border-b border-[#2A3441] px-4 py-2 relative">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <div className="text-yellow-500 font-bold text-xl">exness</div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded">
              <img
                src="https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=20&h=20&fit=crop"
                alt="US"
                className="w-4 h-4 rounded-sm"
              />
              <span className="text-sm">XAU/USD</span>
            </div>
            <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded">
              <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
                ₿
              </div>
              <span className="text-sm">BTC</span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-green-500 font-medium">
              {userBal !== null
                ? `${userBal.toLocaleString()} USD`
                : "Loading..."}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
              Demo
            </span>
            <span className="text-gray-400 text-sm">Standard</span>
          </div>
          <div className="flex items-center space-x-2 relative">
            <Clock className="w-5 h-5 text-gray-400" />
            <Settings className="w-5 h-5 text-gray-400" />
            <Grid3X3 className="w-5 h-5 text-gray-400" />

            {/* User icon with dropdown */}
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)}>
                <User className="w-5 h-5 text-gray-400 cursor-pointer" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded shadow-lg z-50">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition-colors">
            Deposit
          </button>
        </div>
      </div>
    </header>
  );
}
