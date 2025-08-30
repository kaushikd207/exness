"use client";

import { useState, useEffect } from "react";

interface Asset {
  name: string;
  symbol: string; // e.g. BTC, SOL
  buyPrice: number;
  sellPrice: number;
  decimals: number;
  imageUrl: string;
}

export default function LeftSidebar() {
  const [assets, setAssets] = useState<Asset[]>([]);

  // 1. Fetch static asset info
  useEffect(() => {
    fetch("http://localhost:4000/api/v1/assets")
      .then((res) => res.json())
      .then((data) => {
        if (data.assets) setAssets(data.assets);
      })
      .catch((err) => console.error("API error:", err));
  }, []);

  // 2. WebSocket for live prices
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("✅ WS connected");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("📩 Live update:", msg);

        // Example: { symbol: "BTCUSDT", price: 108421.85 }
        const rawSymbol = msg.symbol; // e.g. BTCUSDT
        const baseSymbol = rawSymbol.replace("USDT", ""); // → BTC

        setAssets((prev) =>
          prev.map((a) =>
            a.symbol === baseSymbol
              ? {
                  ...a,
                  buyPrice: msg.price * Math.pow(10, a.decimals), // store scaled
                  sellPrice: msg.price * 1.01 * Math.pow(10, a.decimals), // 1% spread
                }
              : a
          )
        );
      } catch (err) {
        console.error("❌ WS parse error:", err);
      }
    };

    ws.onclose = () => {
      console.log("⚠️ WS disconnected");
    };

    return () => ws.close();
  }, []);

  return (
    <div className="p-4 bg-[#141d22] text-white w-72 h-screen overflow-y-auto">
      <h2 className="text-lg font-bold mb-3">Markets</h2>

      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        <div className="grid grid-cols-3 text-sm font-semibold bg-gray-700 p-2">
          <span>Symbol</span>
          <span className="text-green-400 text-right">Bid</span>
          <span className="text-red-400 text-right">Ask</span>
        </div>
        {assets.map((a, idx) => {
          const bid = a.buyPrice / Math.pow(10, a.decimals || 2);
          const ask = a.sellPrice / Math.pow(10, a.decimals || 2);

          return (
            <div
              key={idx}
              className="grid grid-cols-3 items-center border-b border-gray-700 p-2 hover:bg-gray-700"
            >
              <div className="flex items-center gap-2">
                <img
                  src={a.imageUrl}
                  alt={a.symbol}
                  className="w-5 h-5 rounded-full"
                />
                <span>{a.symbol}</span>
              </div>
              <span className="text-green-400 text-right">
                {bid.toFixed(2)}
              </span>
              <span className="text-red-400 text-right">{ask.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
