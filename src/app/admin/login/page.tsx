"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import rateLimiter from "@/lib/rateLimit";
import { toastMessages } from "@/lib/toast-messages";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState("");
  const [remainingTime, setRemainingTime] = useState(0);

  const ADMIN_IDENTIFIER = "admin"; // Use a constant identifier for admin

  // Check lockout status on component mount and update timer
  useEffect(() => {
    const checkLockout = () => {
      const lockoutStatus = rateLimiter.isLockedOut(ADMIN_IDENTIFIER);
      if (lockoutStatus.locked && lockoutStatus.remainingTime) {
        setRemainingTime(lockoutStatus.remainingTime);
        const minutes = Math.floor(lockoutStatus.remainingTime / 60);
        const seconds = lockoutStatus.remainingTime % 60;
        setLockoutMessage(
          `Too many failed attempts. Please try again in ${minutes}:${seconds.toString().padStart(2, "0")}`
        );
      } else {
        setLockoutMessage("");
        setRemainingTime(0);
      }
    };

    checkLockout();

    // Update timer every second if locked out
    if (remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setLockoutMessage("");
            return 0;
          }
          const newTime = prev - 1;
          const minutes = Math.floor(newTime / 60);
          const seconds = newTime % 60;
          setLockoutMessage(
            `Too many failed attempts. Please try again in ${minutes}:${seconds.toString().padStart(2, "0")}`
          );
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [remainingTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check if admin is locked out
    const lockoutStatus = rateLimiter.isLockedOut(ADMIN_IDENTIFIER);
    if (lockoutStatus.locked && lockoutStatus.remainingTime) {
      const minutes = Math.floor(lockoutStatus.remainingTime / 60);
      const seconds = lockoutStatus.remainingTime % 60;
      setError(
        `Too many failed attempts. Please try again in ${minutes}:${seconds.toString().padStart(2, "0")}`
      );
      setRemainingTime(lockoutStatus.remainingTime);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Record failed attempt
        const result = rateLimiter.recordFailedAttempt(ADMIN_IDENTIFIER);

        if (result.locked && result.lockoutTime) {
          const minutes = Math.floor(result.lockoutTime / 60);
          const errorMsg = `Too many failed login attempts. Account locked for ${minutes} minutes.`;
          setError(errorMsg);
          setRemainingTime(result.lockoutTime);
          toastMessages.auth.rateLimited(`${minutes} minutes`);
        } else {
          const errorMsg = `${data.error || "Invalid password"}. ${result.attemptsLeft} attempt${result.attemptsLeft !== 1 ? "s" : ""} remaining.`;
          setError(errorMsg);
          toastMessages.auth.loginError(errorMsg);
        }
        setLoading(false);
        return;
      }

      // Successful login - reset attempts
      rateLimiter.resetAttempts(ADMIN_IDENTIFIER);

      // Store user type (token is in HTTP-only cookie)
      localStorage.setItem("userType", "admin");

      // Show success toast
      toastMessages.auth.loginSuccess("admin");

      // Redirect to admin dashboard
      router.push("/admin/dashboard");
    } catch (err) {
      const errorMsg = "An error occurred. Please try again.";
      setError(errorMsg);
      toastMessages.general.networkError();
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
            disabled={loading || remainingTime > 0}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : remainingTime > 0 ? "Account Locked" : "Sign in as Admin"}
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
