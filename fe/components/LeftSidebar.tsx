"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  X,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface Asset {
  name: string;
  symbol: string; // BTC, SOL, AAPL etc
  buyPrice: number;
  sellPrice: number;
  decimals: number;
  imageUrl: string;
}

export default function LeftSidebar() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [favoritesOpen, setFavoritesOpen] = useState(true);

  // 1. Fetch assets list
  useEffect(() => {
    fetch("http://localhost:4000/api/v1/assets")
      .then((res) => res.json())
      .then((data) => {
        if (data.assets) setAssets(data.assets);
      })
      .catch((err) => console.error("API error:", err));
  }, []);

  // 2. WebSocket for live updates
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => console.log("✅ WS connected");
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        // Expected: { symbol: "BTCUSDT", price: 108421.85 }
        const rawSymbol = msg.symbol;
        const baseSymbol = rawSymbol.replace("USDT", ""); // e.g. BTC

        setAssets((prev) =>
          prev.map((a) =>
            a.symbol === baseSymbol
              ? {
                  ...a,
                  buyPrice: msg.price * Math.pow(10, a.decimals),
                  sellPrice: msg.price * 1.01 * Math.pow(10, a.decimals), // 1% spread
                }
              : a
          )
        );
      } catch (err) {
        console.error("❌ WS parse error:", err);
      }
    };
    ws.onclose = () => console.log("⚠️ WS disconnected");

    return () => ws.close();
  }, []);

  // 3. Filtering
  const filteredAssets = assets.filter(
    (a) =>
      a.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#2A3441] rounded-lg w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3A4854]">
        <h2 className="text-sm font-medium text-gray-300">INSTRUMENTS</h2>
        <div className="flex items-center space-x-2">
          <button className="text-gray-400 hover:text-white transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-[#3A4854]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1f28] border border-[#3A4854] rounded px-10 py-2 text-white placeholder-gray-500 focus:border-[#4A5864] focus:outline-none"
          />
        </div>
      </div>

      {/* Favorites */}
      <div className="p-4 border-b border-[#3A4854]">
        <button
          onClick={() => setFavoritesOpen(!favoritesOpen)}
          className="w-full flex items-center justify-between text-left hover:text-white transition-colors"
        >
          <span className="text-sm font-medium">Favorites</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              favoritesOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Instruments List */}
      <div className="px-4 py-2">
        <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 mb-2 px-2">
          <span>Symbol</span>
          <span>Signal</span>
          <span>Bid</span>
          <span>Ask</span>
        </div>

        <div className="space-y-1 max-h-96 overflow-y-auto">
          {filteredAssets.map((a) => {
            const bid = a.buyPrice / Math.pow(10, a.decimals || 2);
            const ask = a.sellPrice / Math.pow(10, a.decimals || 2);

            // Simple signal logic: up if bid < ask, down if bid > ask
            let signal: "up" | "down" | "neutral" = "neutral";
            if (bid < ask) signal = "up";
            else if (bid > ask) signal = "down";

            return (
              <div
                key={a.symbol}
                className="grid grid-cols-4 gap-2 items-center p-2 hover:bg-[#3A4854] rounded transition-colors cursor-pointer"
              >
                {/* Symbol + Icon */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-400 text-xs">::</span>
                    <img
                      src={a.imageUrl}
                      alt={a.symbol}
                      className="w-5 h-5 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-medium">{a.symbol}</span>
                </div>

                {/* Signal */}
                <div className="flex justify-center">
                  {signal === "up" && (
                    <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {signal === "down" && (
                    <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center">
                      <TrendingDown className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {signal === "neutral" && (
                    <div className="w-5 h-5 bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs">-</span>
                    </div>
                  )}
                </div>

                {/* Bid/Ask */}
                <span className="text-sm">{bid.toFixed(2)}</span>
                <span className="text-sm">{ask.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
