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

<<<<<<< HEAD
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.menu || []);
        setOrders(data.orders || []);
      } else {
        console.error("Failed to fetch menu items");
        setMenuItems([
          {
            menuId: "1",
            name: "Paneer Paratha",
            description: "Whole wheat paratha stuffed with spiced paneer",
            price: 40,
            category: "breakfast",
            available: true,
          },
          {
            menuId: "2",
            name: "Idli Sambar",
            description: "Steamed rice cakes with lentil curry and chutney",
            price: 35,
            category: "breakfast",
            available: true,
          },
          {
            menuId: "3",
            name: "Dal Makhani with Rice",
            description: "Creamy black lentils with steamed basmati rice",
            price: 70,
            category: "lunch",
            available: true,
          },
          {
            menuId: "4",
            name: "Chicken Biryani",
            description: "Fragrant basmati rice cooked with marinated chicken",
            price: 120,
            category: "lunch",
            available: true,
          },
          {
            menuId: "5",
            name: "Veg Thali",
            description: "Complete meal with dal, sabzi, roti, rice, and curd",
            price: 90,
            category: "lunch",
            available: true,
          },
          {
            menuId: "6",
            name: "Roti with Paneer Curry",
            description: "Indian bread with cottage cheese curry",
            price: 80,
            category: "dinner",
            available: true,
          },
          {
            menuId: "7",
            name: "Fried Rice",
            description: "Indo-Chinese style fried rice with vegetables",
            price: 65,
            category: "dinner",
            available: true,
          },
          {
            menuId: "8",
            name: "Samosa",
            description: "Crispy pastry filled with spiced potatoes",
            price: 20,
            category: "snacks",
            available: true,
          },
          {
            menuId: "9",
            name: "Veg Sandwich",
            description: "Grilled sandwich with vegetables and cheese",
            price: 40,
            category: "snacks",
            available: true,
          },
          {
            menuId: "10",
            name: "Pakora",
            description: "Crispy vegetable fritters",
            price: 30,
            category: "snacks",
            available: false,
          },
          {
            menuId: "11",
            name: "noodles",
            description: "vegetable, chicken with cheese or not",
            price: 100,
            category: "breakfast",
            available: true,
          },
        ]);
=======
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
>>>>>>> 5a770e0fa2590512f31d7de009221f095005386a
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-300 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/40 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/30">

        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto h-14 w-14 bg-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
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

          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            Access your hostel management dashboard
          </p>
        </div>

        {/* Form Section */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700"
            >
              Admin Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-700 text-sm text-center bg-red-100 border border-red-300 p-3 rounded-lg shadow-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 shadow-md bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in as Admin"}
          </button>

          {/* Back Link */}
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-all"
            >
              ← Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
