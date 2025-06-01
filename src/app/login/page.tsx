"use client";
import { signIn, type SignInResponse } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

const DEMOS = [
  { label: "Admin", email: "admin@schoolwave.com", password: "admin123" },
  { label: "Content Admin", email: "contentadmin@schoolwave.com", password: "content123" },
  { label: "Agent", email: "agent@schoolwave.com", password: "agent123" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/dashboard", // 👈 Redirects correctly after login
    }) as SignInResponse | undefined;

    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else if (res?.ok && res.url) {
      window.location.href = res.url;
    }
  };

  const handleDemo = (demo: typeof DEMOS[number]) => {
    setEmail(demo.email);
    setPassword(demo.password);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
