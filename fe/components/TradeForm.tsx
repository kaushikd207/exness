"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronDown, Minus, Plus } from "lucide-react";
import { useBalanceStore } from "@/store";

interface Asset {
  symbol: string;
  buyPrice: number;
  sellPrice: number;
  decimals: number;
  imageUrl: string;
}

export default function TradeForm() {
  const [orderType, setOrderType] = useState<"market" | "pending">("market");
  const [volume, setVolume] = useState("10.00");
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(1000000);
  const [trade, setTrade] = useState<any>(null);
  const [error, setError] = useState("");
  const bal = useBalanceStore((state: any) => state.updateBalance);
  const updateBtcPrice = useBalanceStore((state: any) => state.updateBtcPrice);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ✅ Fetch initial BTC data
  useEffect(() => {
    fetch("http://localhost:4000/api/v1/assets")
      .then((res) => res.json())
      .then((data) => {
        if (data.assets && data.assets.length > 0) {
          const btc = data.assets.find((a: Asset) => a.symbol === "BTC");
          setAsset(btc || data.assets[0]);
        }
      })
      .catch((err) => console.error("API error:", err));
  }, []);

  // ✅ WebSocket for live BTC price
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        updateBtcPrice(msg.price);
        if (msg.symbol === "BTCUSDT") {
          setAsset((prev) =>
            prev
              ? {
                  ...prev,
                  buyPrice: msg.price * Math.pow(10, prev.decimals),
                  sellPrice: msg.price * 1.01 * Math.pow(10, prev.decimals), // spread
                }
              : prev
          );
        }
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };
    return () => ws.close();
  }, []);

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
      bal(data?.usd_balance);
    } catch (err) {
      console.error("Error fetching balance", err);
    }
  };

  const handleOrder = async (side: "buy" | "sell") => {
    setError("");
    fetchBalance();
    if (!asset) return;

    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login again.");
      setLoading(false);
      return;
    }

    // pick correct live price based on side
    const currentPrice =
      side === "buy"
        ? asset.buyPrice / Math.pow(10, asset.decimals)
        : asset.sellPrice / Math.pow(10, asset.decimals);
    console.log(volume, currentPrice, balance);
    if (volume * currentPrice > balance) {
      setError("Insufficient balance");
      setLoading(false);
      return;
    }

    const updateBalance = balance - volume * currentPrice.toFixed(2);
    setBalance(updateBalance);
    bal(updateBalance);

    try {
      const res = await fetch("http://localhost:4000/api/v1/trades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: side,
          margin: Number(volume),
          leverage: 0,
          openPrice: currentPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error placing order");
      } else {
        setTrade(data); // store full trade response
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#2A3441] rounded-lg p-4 w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            ₿
          </div>
          <span className="font-medium">{asset?.symbol || "Loading..."}</span>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Sell/Buy Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => handleOrder("sell")}
          disabled={loading}
          className="bg-red-600/20 border border-red-600 text-red-400 rounded p-3 hover:bg-red-600/30 transition-colors"
        >
          <div className="text-sm font-medium">{loading ? "..." : "Sell"}</div>
          <div className="text-lg font-bold">
            {asset
              ? (asset.sellPrice / Math.pow(10, asset.decimals)).toFixed(2)
              : "--"}
          </div>
        </button>
        <button
          onClick={() => handleOrder("buy")}
          disabled={loading}
          className="bg-blue-600/20 border border-blue-600 text-blue-400 rounded p-3 hover:bg-blue-600/30 transition-colors"
        >
          <div className="text-sm font-medium">{loading ? "..." : "Buy"}</div>
          <div className="text-lg font-bold">
            {asset
              ? (asset.buyPrice / Math.pow(10, asset.decimals)).toFixed(2)
              : "--"}
          </div>
        </button>
      </div>

      {/* Market/Pending Toggle */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <button
          onClick={() => setOrderType("market")}
          className={`py-2 px-4 rounded text-sm font-medium transition-colors ${
            orderType === "market"
              ? "bg-[#3A4854] text-white"
              : "bg-[#1a1f28] text-gray-400 hover:text-white"
          }`}
        >
          Market
        </button>
        <button
          onClick={() => setOrderType("pending")}
          className={`py-2 px-4 rounded text-sm font-medium transition-colors ${
            orderType === "pending"
              ? "bg-[#3A4854] text-white"
              : "bg-[#1a1f28] text-gray-400 hover:text-white"
          }`}
        >
          Pending
        </button>
      </div>

      {/* Volume */}
      {/* Volume */}
      <div className="mb-6">
        <label className="block text-sm text-gray-300 mb-2">Volume</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            step="0.01" // ✅ allows decimals
            min="0.01"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="flex-1 bg-[#1a1f28] border border-[#3A4854] rounded px-3 py-2 text-white focus:border-[#4A5864] focus:outline-none"
          />
          <span className="text-sm text-white">Lots</span>

          {/* Decrement button */}
          <button
            onClick={() =>
              setVolume((prev) => {
                const val = parseFloat(prev) || 0;
                return Math.max(val - 0.1, 0.01).toFixed(2); // ✅ keep 2 decimals
              })
            }
            className="w-8 h-8 bg-green-200 border border-[#3A4854] rounded flex items-center justify-center hover:border-[#4A5864] transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Increment button */}
          <button
            onClick={() =>
              setVolume((prev) => {
                const val = parseFloat(prev) || 0;
                return (val + 0.1).toFixed(2); // ✅ step 0.1
              })
            }
            className="w-8 h-8 bg-green-200 border border-[#3A4854] rounded flex items-center justify-center hover:border-[#4A5864] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
    </div>
  );
}
