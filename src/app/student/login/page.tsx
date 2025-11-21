"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import rateLimiter from "@/lib/rateLimit";
import { toastMessages } from "@/lib/toast-messages";
import AuthCarousel from "@/app/components/AuthCarousel";

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

  useEffect(() => {
    const checkLockout = () => {
      if (!formData.studentId) return;

      const lockoutStatus = rateLimiter.isLockedOut(formData.studentId);
      if (lockoutStatus.locked && lockoutStatus.remainingTime) {
        setRemainingTime(lockoutStatus.remainingTime);
        const minutes = Math.floor(lockoutStatus.remainingTime / 60);
        const seconds = lockoutStatus.remainingTime % 60;
        setLockoutMessage(
          `Too many failed attempts. Please try again in ${minutes}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      } else {
        setLockoutMessage("");
        setRemainingTime(0);
      }
    };

    checkLockout();

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
            `Too many failed attempts. Please try again in ${minutes}:${seconds
              .toString()
              .padStart(2, "0")}`
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

    const lockoutStatus = rateLimiter.isLockedOut(formData.studentId);
    if (lockoutStatus.locked && lockoutStatus.remainingTime) {
      const minutes = Math.floor(lockoutStatus.remainingTime / 60);
      const seconds = lockoutStatus.remainingTime % 60;
      setError(
        `Too many failed attempts. Please try again in ${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`
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
        const result = rateLimiter.recordFailedAttempt(formData.studentId);

        if (result.locked && result.lockoutTime) {
          const minutes = Math.floor(result.lockoutTime / 60);
          const errorMsg = `Too many failed login attempts. Account locked for ${minutes} minutes.`;
          setError(errorMsg);
          setRemainingTime(result.lockoutTime);
          toastMessages.auth.rateLimited(`${minutes} minutes`);
        } else {
          const errorMsg = `${data.error || "Invalid credentials"}. ${
            result.attemptsLeft
          } attempt${result.attemptsLeft !== 1 ? "s" : ""} remaining.`;
          setError(errorMsg);
          toastMessages.auth.loginError(errorMsg);
        }
        setLoading(false);
        return;
      }

      rateLimiter.resetAttempts(formData.studentId);

      localStorage.setItem("userType", "student");
      localStorage.setItem("studentData", JSON.stringify(data.student));

      toastMessages.auth.loginSuccess("student", data.student?.name);

      router.push("/student/dashboard");
    } catch (err) {
      const errorMsg = "An error occurred. Please try again.";
      setError(errorMsg);
      toastMessages.general.networkError();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      {/* Left Side */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 order-1">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-block p-3 bg-indigo-100 rounded-2xl mb-4 shadow-md">
              <svg
                className="h-12 w-12 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Student Login
            </h2>
            <p className="text-gray-600">Access your hostel dashboard</p>
          </div>

          {/* Form */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/30 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,0,0,0.1)] hover:scale-[1.01]">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Student ID */}
              <div>
                <label
                  htmlFor="studentId"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Student ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                      />
                    </svg>
                  </div>
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    required
                    className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl bg-white/80 shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                    placeholder="Enter your student ID"
                    value={formData.studentId}
                    onChange={(e) =>
                      setFormData({ ...formData, studentId: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl bg-white/80 shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-100/70 backdrop-blur-md border border-red-300/50 text-red-700 px-4 py-3 rounded-xl text-sm shadow-sm flex items-start">
                  <svg
                    className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Button */}
              <button
                type="submit"
                disabled={loading || remainingTime > 0}
                className="w-full flex justify-center items-center py-3 px-4 rounded-2xl text-base font-semibold text-white 
                bg-gradient-to-r from-indigo-600 to-purple-600 
                shadow-lg hover:shadow-xl 
                hover:from-indigo-700 hover:to-purple-700 
                focus:ring-4 focus:ring-indigo-300 
                transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : remainingTime > 0 ? (
                  "Account Locked"
                ) : (
                  <>
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign in
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/student/signup"
                className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Sign up here
              </Link>
            </p>
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:block lg:w-1/2 xl:w-3/5 order-2">
        <AuthCarousel />
      </div>
    </div>
  );
}
