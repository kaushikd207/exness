"use client";

import { useState } from "react";

export default function TradeForm() {
  const [type, setType] = useState<"buy" | "sell">("buy");
  const [margin, setMargin] = useState("");
  const [leverage, setLeverage] = useState("");
  const [loading, setLoading] = useState(false);
  const [trade, setTrade] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:4000/api/v1/trades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFmOGMwOWE3LTE1MjAtNDQ0OS05NTVjLTdlZWQyY2JhNTBkOCIsImVtYWlsIjoia2F1c2hpa2QyMDdAZ21haWwuY29tIiwiaWF0IjoxNzU2NTM5NzA4fQ.2ZnxDLrB8Vdc18lXgjW6aCQFDLAvfVoTWeQIRPAtCLQ", // replace with real auth
        },
        body: JSON.stringify({
          type,
          margin: Number(margin),
          leverage: Number(leverage),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error creating trade");
      } else {
        setTrade(data.trade);
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[141d22] rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold mb-4 text-center">Place Order</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Buy/Sell Toggle */}
        <div className="flex space-x-2">
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg font-medium ${
              type === "buy"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setType("buy")}
          >
            Buy
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg font-medium ${
              type === "sell"
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setType("sell")}
          >
            Sell
          </button>
        </div>

        {/* Margin Input */}
        <div>
          <label className="block text-sm font-medium mb-1 text-white">
            Margin ($)
          </label>
          <input
            type="number"
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 bg-white"
            placeholder="Enter margin"
            required
          />
        </div>

        {/* Leverage Input */}
        <div>
          <label className="block text-sm font-medium mb-1 text-white">
            Leverage
          </label>
          <input
            type="number"
            value={leverage}
            onChange={(e) => setLeverage(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 bg-white"
            placeholder="Enter leverage"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </form>

      {/* Error */}
      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

      {/* Order Preview */}
      {trade && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Order Created</h3>
          <p>
            <span className="font-medium">Type:</span>{" "}
            <span
              className={
                trade.type === "buy" ? "text-green-600" : "text-red-600"
              }
            >
              {trade.type}
            </span>
          </p>
          <p>
            <span className="font-medium">Margin:</span> {trade.margin / 100} $
          </p>
          <p>
            <span className="font-medium">Leverage:</span> {trade.leverage}x
          </p>
          <p>
            <span className="font-medium">Open Price:</span>{" "}
            {trade.openPrice / 10000} $
          </p>
          <p>
            <span className="font-medium">Close Price:</span>{" "}
            {trade.closePrice / 10000} $
          </p>
        </div>
      )}
    </div>
  );
}
