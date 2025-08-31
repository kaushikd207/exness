"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("http://localhost:4000/api/v1/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      router.push("/"); // ✅ redirect to homepage
    } else {
      alert(data.message || "Login failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleLogin} className="bg-grey-800 p-6 rounded-lg w-96">
        <h2 className="text-white text-2xl mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-white"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 p-2 rounded text-white"
        >
          Login
        </button>
      </form>
    </div>
  );
}
