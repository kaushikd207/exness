"use client";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function LiveTrades() {
  const { messages, status } = useWebSocket("ws://localhost:8080");

  // Get latest trade
  const latest = messages.length
    ? typeof messages[messages.length - 1] === "string"
      ? JSON.parse(messages[messages.length - 1])
      : messages[messages.length - 1]
    : null;

  // Calculate Bid & Ask (Ask = Bid - 1%)
  const bid = latest?.price ? parseFloat(latest.price) : null;
  const ask = bid ? bid * 0.99 : null;

  return (
    <div className="p-4 border rounded-xl bg-[#141d22] text-white shadow-lg max-w-sm">
      <h2 className="text-lg font-semibold mb-3 flex justify-between">
        Live Price
        <span className="text-xs text-gray-400">({status})</span>
      </h2>

      {bid ? (
        <div className="flex justify-between items-center gap-6">
          {/* Bid */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-green-500 font-bold text-xl">
              {bid.toFixed(2)}
            </span>
            <span className="text-xs text-gray-400">Bid</span>
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-gray-700"></div>

          {/* Ask */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-red-500 font-bold text-xl">
              {ask?.toFixed(2)}
            </span>
            <span className="text-xs text-gray-400">Ask (-1%)</span>
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-center">Waiting for trades...</p>
      )}
    </div>
  );
}
