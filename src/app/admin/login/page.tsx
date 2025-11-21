"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userType", "admin");

      router.push("/admin/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 
      bg-gradient-to-br from-purple-600 via-indigo-500 to-purple-700">

      <div className="w-full max-w-md backdrop-blur-xl bg-white/20 
        rounded-3xl shadow-2xl p-10 space-y-8 border border-white/30">

        {/* Icon + Title */}
        <div className="text-center">
          <div className="mx-auto h-14 w-14 bg-gradient-to-r from-purple-500 to-indigo-500 
            rounded-2xl flex items-center justify-center shadow-lg">
            <svg
              className="h-7 w-7 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 className="mt-5 text-4xl font-extrabold text-white drop-shadow-lg tracking-wide">
            Admin Login
          </h2>

          <p className="mt-1 text-sm text-purple-100 tracking-wide">
            Access your management dashboard
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/90"
            >
              Admin Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-2 block w-full px-4 py-3 rounded-xl 
              bg-white/20 backdrop-blur-md border border-white/40
              text-white placeholder-purple-200
              shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300 
              transition"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-300 bg-red-900/30 text-sm text-center 
            p-3 rounded-lg border border-red-400/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm
            bg-gradient-to-r from-purple-600 to-indigo-600 
            shadow-lg hover:shadow-xl hover:scale-[1.02]
            transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Login as Admin"}
          </button>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-purple-200 hover:text-white transition"
            >
              ⟵ Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
