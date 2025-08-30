export async function fetchAssets() {
  const res = await fetch("http://localhost:4000/api/v1/assets");
  if (!res.ok) throw new Error("Failed to fetch assets");
  return res.json();
}

export const API_BASE = "http://localhost:4000/trades"; // adjust port if different

// Buy/Sell order
export async function placeOrder(
  token: string,
  type: "buy" | "sell",
  margin: number,
  leverage: number
) {
  const res = await fetch(`${API_BASE}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // assuming JWT from authMiddleware
    },
    body: JSON.stringify({ type, margin, leverage }),
  });

  if (!res.ok) throw new Error("Order failed");
  return res.json();
}

// Fetch open trades
export async function getOpenTrades(token: string) {
  const res = await fetch(`${API_BASE}/open`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch open trades");
  return res.json();
}

// Fetch closed trades
export async function getClosedTrades(token: string) {
  const res = await fetch(`${API_BASE}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch closed trades");
  return res.json();
}
