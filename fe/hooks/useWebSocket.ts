"use client";
import { useEffect, useState } from "react";

export function useWebSocket(url: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [status, setStatus] = useState<"connected" | "disconnected">(
    "disconnected"
  );

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setStatus("connected");
      console.log("✅ Connected to WebSocket:", url);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch {
        setMessages((prev) => [...prev, event.data]);
      }
    };

    ws.onclose = () => {
      setStatus("disconnected");
      console.log("❌ WebSocket disconnected");
    };

    return () => ws.close();
  }, [url]);

  return { messages, status };
}
