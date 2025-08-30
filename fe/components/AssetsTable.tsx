"use client";
import "../app/globals.css";
import { useEffect, useState } from "react";

interface Asset {
  symbol: string;
  price: number;
}

export default function AssetsTable() {
  const [assets, setAssets] = useState<Asset[]>([]); // ✅ start with empty array
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/v1/assets") // your backend route
      .then((res) => res.json())
      .then((data) => {
        // ✅ check if API returns { assets: [...] } or just [...]
        const parsed = Array.isArray(data) ? data : data.assets;
        setAssets(parsed || []);
      })
      .catch((err) => {
        console.error("Error fetching assets:", err);
        setAssets([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-200">
          <th className="py-2 px-4 border">Symbol</th>
          <th className="py-2 px-4 border">Price</th>
        </tr>
      </thead>
      <tbody>
        {assets.map((a, idx) => (
          <tr key={idx} className="border-b">
            <td className="py-2 px-4 border">{a.symbol}</td>
            <td className="py-2 px-4 border">{a.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
