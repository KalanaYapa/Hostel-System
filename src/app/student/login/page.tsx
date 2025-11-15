"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import rateLimiter from "@/lib/rateLimit";

export default function StudentLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    studentId: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState("");
  const [remainingTime, setRemainingTime] = useState(0);

  // Check lockout status on component mount and update timer
  useEffect(() => {
    const checkLockout = () => {
      if (!formData.studentId) return;

      const lockoutStatus = rateLimiter.isLockedOut(formData.studentId);
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
  }, [formData.studentId, remainingTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check if user is locked out
    const lockoutStatus = rateLimiter.isLockedOut(formData.studentId);
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
      const response = await fetch("/api/auth/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Record failed attempt
        const result = rateLimiter.recordFailedAttempt(formData.studentId);

        if (result.locked && result.lockoutTime) {
          const minutes = Math.floor(result.lockoutTime / 60);
          setError(
            `Too many failed login attempts. Account locked for ${minutes} minutes.`
          );
          setRemainingTime(result.lockoutTime);
        } else {
          setError(
            `${data.error || "Invalid credentials"}. ${result.attemptsLeft} attempt${result.attemptsLeft !== 1 ? "s" : ""} remaining.`
          );
        }
        setLoading(false);
        return;
      }

      // Successful login - reset attempts
      rateLimiter.resetAttempts(formData.studentId);

      // Store token
      localStorage.setItem("token", data.token);
      localStorage.setItem("userType", "student");
      localStorage.setItem("studentData", JSON.stringify(data.student));

      // Redirect to student dashboard
      router.push("/student/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Student Login</h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your hostel dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="studentId"
                className="block text-sm font-medium text-gray-700"
              >
                Student ID
              </label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your student ID"
                value={formData.studentId}
                onChange={(e) =>
                  setFormData({ ...formData, studentId: e.target.value })
                }
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || remainingTime > 0}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : remainingTime > 0 ? "Account Locked" : "Sign in"}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/student/signup"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign up here
              </Link>
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Back to home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
