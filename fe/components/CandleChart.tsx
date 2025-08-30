"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  CandlestickData,
  Time,
} from "lightweight-charts";

const timeframes = ["1m", "5m", "15m", "30m", "1h"];

export default function CandleChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<any>(null);

  const [timeframe, setTimeframe] = useState("5m");
  const [livePrice, setLivePrice] = useState<number | null>(null);

  // ✅ Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: "#0d1117" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: { color: "#1e222d" },
        horzLines: { color: "#1e222d" },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "#1e222d",
      },
      timeScale: {
        borderColor: "#1e222d",
        timeVisible: true,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current?.clientWidth || 600,
      });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // ✅ Fetch candles on timeframe change
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    fetch(`http://localhost:4000/api/v1/candles?asset=BTCUSDT&ts=${timeframe}`)
      .then((res) => res.json())
      .then((data) => {
        let raw = Array.isArray(data)
          ? data
          : Array.isArray(data?.candles)
          ? data.candles
          : [];

        const candles: CandlestickData[] = raw.map((c: any) => ({
          time: Math.floor(c.timestamp / 1000) as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));

        candleSeriesRef.current.setData(candles);

        if (candles.length > 0) {
          setLivePrice(candles[candles.length - 1].close);
        }
      });
  }, [timeframe]);

  // ✅ Live price update via WebSocket
  useEffect(() => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");

    ws.onmessage = (event) => {
      const trade = JSON.parse(event.data);
      const price = parseFloat(trade.p);
      setLivePrice(price);

      // push into last candle live
      if (candleSeriesRef.current) {
        candleSeriesRef.current.update({
          time: Math.floor(trade.T / 1000) as Time,
          open: price,
          high: price,
          low: price,
          close: price,
        });
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="p-4 text-white">
      {/* Header with Symbol + Live Price */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          BTC/USDT{" "}
          <span
            className={`ml-2 font-mono ${
              livePrice && livePrice > 0 ? "text-green-400" : "text-gray-400"
            }`}
          >
            {livePrice ? livePrice.toFixed(2) : "--"}
          </span>
        </h2>

        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded ${
                timeframe === tf ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div ref={chartContainerRef} className="w-full h-[500px]" />
    </div>
  );
}
