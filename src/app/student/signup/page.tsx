"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toastMessages } from "@/lib/toast-messages";
import AuthCarousel from "@/app/components/AuthCarousel";

export default function StudentSignup() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [formData, setFormData] = useState({
    studentId: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
    phone: "",
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      const errorMsg = "Passwords do not match";
      setError(errorMsg);
      toastMessages.general.validationError(errorMsg);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      const errorMsg = "Password must be at least 6 characters long";
      setError(errorMsg);
      toastMessages.general.validationError(errorMsg);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/student/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: formData.studentId,
          password: formData.password,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const data = await response.json();
      console.log("API Response:", { status: response.status, ok: response.ok, data });

      if (!response.ok) {
        const errorMsg = data.error || "Failed to send OTP";
        setError(errorMsg);
        toastMessages.auth.signupError(errorMsg);
        setLoading(false);
        return;
      }

      // Show success and move to OTP verification
      toastMessages.general.success("OTP sent to your email!");
      setStep("otp");
      setLoading(false);
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      const errorMsg = "An error occurred. Please try again.";
      setError(errorMsg);
      toastMessages.general.networkError();
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      const errorMsg = "Please enter a valid 6-digit OTP";
      setError(errorMsg);
      toastMessages.general.validationError(errorMsg);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/student/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "OTP verification failed";
        setError(errorMsg);
        toastMessages.auth.signupError(errorMsg);

        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }

        setLoading(false);
        return;
      }

      // Store token
      localStorage.setItem("token", data.token);
      localStorage.setItem("userType", "student");
      localStorage.setItem("studentData", JSON.stringify(data.student));

      // Show success toast
      toastMessages.auth.signupSuccess();

      // Redirect to student dashboard
      router.push("/student/dashboard");
    } catch (err) {
      const errorMsg = "An error occurred. Please try again.";
      setError(errorMsg);
      toastMessages.general.networkError();
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);
    setOtp("");

    try {
      const response = await fetch("/api/auth/student/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: formData.studentId,
          password: formData.password,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Failed to resend OTP";
        setError(errorMsg);
        toastMessages.general.error(errorMsg);
        setLoading(false);
        return;
      }

      toastMessages.general.success("New OTP sent to your email!");
      setAttemptsRemaining(5);
      setLoading(false);
    } catch (err) {
      const errorMsg = "Failed to resend OTP. Please try again.";
      setError(errorMsg);
      toastMessages.general.networkError();
      setLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - OTP Form */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 order-1 lg:order-1">
          <div className="max-w-md w-full space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="inline-block p-3 bg-green-100 rounded-2xl mb-4">
                <svg
                  className="h-12 w-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                  />
                </svg>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Verify Your Email
              </h2>
              <p className="text-gray-600">
                We sent a 6-digit code to <br />
                <strong className="text-indigo-600">{formData.email}</strong>
              </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form className="space-y-6" onSubmit={handleVerifyOTP}>
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-semibold text-gray-700 mb-2 text-center"
                  >
                    Enter OTP Code
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    className="mt-2 block w-full px-4 py-4 text-center text-3xl tracking-widest border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                  <p className="mt-3 text-xs text-gray-500 text-center">
                    The OTP is valid for 10 minutes
                  </p>
                  {attemptsRemaining < 5 && (
                    <p className="mt-1 text-xs text-orange-600 text-center font-semibold">
                      {attemptsRemaining} {attemptsRemaining === 1 ? "attempt" : "attempts"} remaining
                    </p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start">
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

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
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
                      Verifying...
                    </>
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Verify OTP
                    </>
                  )}
                </button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Didn&apos;t receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      Resend OTP
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("form");
                      setOtp("");
                      setError("");
                    }}
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
                    Back to signup form
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side - Carousel */}
        <div className="hidden lg:block lg:w-1/2 xl:w-3/5 order-2 lg:order-2">
          <AuthCarousel />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Signup Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 order-1 lg:order-1">
        <div className="max-w-md w-full space-y-6 max-h-screen overflow-y-auto py-4">
          {/* Header */}
          <div className="text-center">
            <div className="inline-block p-3 bg-indigo-100 rounded-2xl mb-4">
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Student Registration
            </h2>
            <p className="text-gray-600">
              Create your hostel account
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4">
                {/* Student ID */}
                <div>
                  <label
                    htmlFor="studentId"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Student ID
                  </label>
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Enter your student ID"
                    value={formData.studentId}
                    onChange={(e) =>
                      setFormData({ ...formData, studentId: e.target.value })
                    }
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="+94 XX XXX XXXX"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
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
                    Sending OTP...
                  </>
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
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    Continue
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/student/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Sign in here
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

      {/* Right Side - Carousel */}
      <div className="hidden lg:block lg:w-1/2 xl:w-3/5 order-2 lg:order-2">
        <AuthCarousel />
      </div>
    </div>
  );
}
