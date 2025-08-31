"use client";

import React, { useEffect, useState } from "react";
import { X, BarChart3, Grid3X3, MoreHorizontal, Briefcase } from "lucide-react";
import { useBalanceStore } from "@/store";

interface Trade {
  orderId: string;
  type: "buy" | "sell";
  margin: number;
  leverage: number;
  openPrice: number;
  status: string;
  closePrice?: number;
}

export function PositionsPanel() {
  const [activeTab, setActiveTab] = useState<"open" | "pending" | "closed">(
    "open"
  );
  const [trades, setTrades] = useState<Trade[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const bal = useBalanceStore((state: any) => state.bal);
  const currentBtcPrice = useBalanceStore((state: any) => state.currBtcPrice);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ✅ Fetch balance
  const fetchBalance = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:4000/api/v1/balance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setBalance(data.usd_balance || 0);
    } catch (err) {
      console.error("Error fetching balance", err);
    }
  };

  // ✅ Fetch trades depending on active tab
  const fetchTrades = async () => {
    if (!token) return;
    setLoading(true);

    try {
      let endpoint = "http://localhost:4000/api/v1/trades";
      if (activeTab === "open") {
        endpoint = "http://localhost:4000/api/v1/trades/open";
      } else if (activeTab === "closed") {
        endpoint = "http://localhost:4000/api/v1/trades"; // better endpoint if backend supports
      }

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setTrades(data.trades || []);
    } catch (err) {
      console.error("Error fetching trades", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Close trade with actual current price
  const closeTrade = async (orderId: string) => {
    if (!token) return;

    try {
      await fetch("http://localhost:4000/api/v1/trades", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          closePrice: currentBtcPrice, // use live price from store
        }),
      });

      await fetchTrades(); // refresh trades in UI
      await fetchBalance(); // refresh balance
    } catch (err) {
      console.error("Error closing trade", err);
    }
  };

  // ✅ Auto-refresh every 5 seconds
  useEffect(() => {
    fetchTrades();
    fetchBalance();
    const interval = setInterval(() => {
      fetchTrades();
      fetchBalance();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="bg-[#2A3441] rounded-lg w-full p-4 h-[350px] overflow-y-auto">
      <div className="bg-[#2A3441] rounded-lg w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3A4854]">
          <div className="flex items-center space-x-4">
            {["open", "closed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === tab
                    ? "text-white border-b-2 border-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* ✅ Show balance */}
          <div className="text-white text-sm font-semibold">
            Balance: ${bal.toFixed(2)}
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
          </div>
        </div>

        {/* Trades list */}
        <div className="p-4">
          {loading ? (
            <p className="text-gray-400 text-center">Loading...</p>
          ) : trades.length === 0 ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Briefcase className="w-16 h-16 text-gray-500" />
              </div>
              <p className="text-gray-400 text-lg">No {activeTab} positions</p>
            </div>
          ) : (
            <table className="w-full text-sm text-gray-300">
              <thead>
                <tr className="text-gray-400 border-b border-[#3A4854]">
                  <th className="py-2 text-left">Type</th>
                  <th className="py-2 text-left">Current Price</th>
                  <th className="py-2 text-left">Leverage</th>
                  <th className="py-2 text-left">Open Price</th>
                  {activeTab === "closed" && (
                    <th className="py-2 text-left">Close Price</th>
                  )}
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">PnL</th>
                  <th className="py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => {
                  const isClosed = trade.status === "closed";
                  const priceForPnl = isClosed
                    ? trade.closePrice || trade.openPrice
                    : currentBtcPrice;
                  const pnl =
                    trade.type === "buy"
                      ? priceForPnl - trade.openPrice
                      : trade.openPrice - priceForPnl;

                  return (
                    <tr
                      key={trade.orderId}
                      className="border-b border-[#3A4854] hover:bg-[#1a1f28]"
                    >
                      <td
                        className={`py-2 ${
                          trade.type === "buy"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {trade.type.toUpperCase()}
                      </td>
                      <td className="py-2">{currentBtcPrice.toFixed(2)}</td>
                      <td className="py-2">{trade.leverage}x</td>
                      <td className="py-2">{trade.openPrice.toFixed(2)}</td>
                      {activeTab === "closed" && (
                        <td className="py-2">
                          {trade.closePrice ? trade.closePrice.toFixed(2) : "-"}
                        </td>
                      )}
                      <td className="py-2">{trade.status}</td>
                      <td className="py-2">{pnl.toFixed(2)}</td>
                      <td className="py-2">
                        {activeTab === "open" && (
                          <button
                            onClick={() => closeTrade(trade.orderId)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
