"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Statistics {
  attendance: {
    byBranch: { branch: string; present: number; absent: number; total: number }[];
    overall: { present: number; absent: number; percentage: number };
  };
  rooms: {
    byBranch: { branch: string; total: number; occupied: number; available: number }[];
    overall: { total: number; occupied: number; occupancyRate: number };
  };
  fees: {
    paid: number;
    unpaid: number;
    partial: number;
    total: number;
    collectionRate: number;
  };
  maintenance: {
    byStatus: { status: string; count: number }[];
    byCategory: { category: string; count: number }[];
    trends: { month: string; count: number }[];
  };
  food: {
    topItems: { name: string; orders: number }[];
    byCategory: { category: string; orders: number }[];
    revenue: number;
  };
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState("overview");

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/statistics", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.statistics);
      } else {
        // Mock data for development
        setStats({
          attendance: {
            byBranch: [
              { branch: "CS", present: 85, absent: 15, total: 100 },
              { branch: "ECE", present: 72, absent: 8, total: 80 },
              { branch: "ME", present: 58, absent: 12, total: 70 },
              { branch: "CE", present: 45, absent: 5, total: 50 },
              { branch: "EE", present: 38, absent: 7, total: 45 },
            ],
            overall: { present: 298, absent: 47, percentage: 86.4 },
          },
          rooms: {
            byBranch: [
              { branch: "CS", total: 30, occupied: 28, available: 2 },
              { branch: "ECE", total: 25, occupied: 22, available: 3 },
              { branch: "ME", total: 22, occupied: 20, available: 2 },
              { branch: "CE", total: 15, occupied: 13, available: 2 },
              { branch: "EE", total: 18, occupied: 15, available: 3 },
            ],
            overall: { total: 110, occupied: 98, occupancyRate: 89.1 },
          },
          fees: {
            paid: 250,
            unpaid: 45,
            partial: 30,
            total: 325,
            collectionRate: 76.9,
          },
          maintenance: {
            byStatus: [
              { status: "pending", count: 12 },
              { status: "in-progress", count: 8 },
              { status: "completed", count: 45 },
              { status: "rejected", count: 5 },
            ],
            byCategory: [
              { category: "Electrical", count: 25 },
              { category: "Plumbing", count: 18 },
              { category: "Furniture", count: 15 },
              { category: "Cleaning", count: 12 },
            ],
            trends: [
              { month: "Jul", count: 15 },
              { month: "Aug", count: 22 },
              { month: "Sep", count: 18 },
              { month: "Oct", count: 25 },
              { month: "Nov", count: 20 },
            ],
          },
          food: {
            topItems: [
              { name: "Chicken Biryani", orders: 145 },
              { name: "Dal Makhani", orders: 120 },
              { name: "Veg Thali", orders: 98 },
              { name: "Paneer Paratha", orders: 85 },
              { name: "Fried Rice", orders: 72 },
            ],
            byCategory: [
              { category: "Breakfast", orders: 320 },
              { category: "Lunch", orders: 450 },
              { category: "Dinner", orders: 380 },
              { category: "Snacks", orders: 210 },
            ],
            revenue: 125000,
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout type="admin" title="Statistics & Analytics" subtitle="View comprehensive hostel statistics">
        <div className="text-center py-12">
          <p className="text-neutral-600">Loading statistics...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) {
    return (
      <DashboardLayout type="admin" title="Statistics & Analytics" subtitle="View comprehensive hostel statistics">
        <div className="text-center py-12">
          <p className="text-neutral-600">Failed to load statistics</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout type="admin" title="Statistics & Analytics" subtitle="View comprehensive hostel statistics">
      {/* View Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50 mb-8"
      >
        <div className="flex flex-wrap gap-3">
          {[
            { id: "overview", label: "Overview" },
            { id: "attendance", label: "Attendance" },
            { id: "rooms", label: "Rooms" },
            { id: "fees", label: "Fees" },
            { id: "maintenance", label: "Maintenance" },
            { id: "food", label: "Food Orders" },
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              className={`px-6 py-2.5 rounded-2xl transition-all font-medium ${
                selectedView === view.id
                  ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg"
                  : "bg-white text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Overview Section */}
      {selectedView === "overview" && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: "Attendance Rate",
                value: `${stats.attendance.overall.percentage}%`,
                subtitle: `${stats.attendance.overall.present} present`,
                color: "from-green-500 to-emerald-500",
              },
              {
                label: "Room Occupancy",
                value: `${stats.rooms.overall.occupancyRate}%`,
                subtitle: `${stats.rooms.overall.occupied}/${stats.rooms.overall.total} rooms`,
                color: "from-blue-500 to-cyan-500",
              },
              {
                label: "Fee Collection",
                value: `${stats.fees.collectionRate}%`,
                subtitle: `${stats.fees.paid} paid`,
                color: "from-purple-500 to-pink-500",
              },
              {
                label: "Pending Maintenance",
                value: stats.maintenance.byStatus.find((s) => s.status === "pending")?.count || 0,
                subtitle: "requests",
                color: "from-yellow-500 to-orange-500",
              },
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
              >
                <p className="text-sm font-light text-neutral-600 mb-2">{metric.label}</p>
                <p className="text-4xl font-light text-neutral-900 mb-1">{metric.value}</p>
                <p className="text-sm text-neutral-500">{metric.subtitle}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Food Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
            >
              <h3 className="text-xl font-light text-neutral-900 mb-4">Top Food Items</h3>
              <div className="space-y-3">
                {stats.food.topItems.slice(0, 5).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-medium text-neutral-400">#{index + 1}</span>
                      <span className="text-neutral-900">{item.name}</span>
                    </div>
                    <span className="font-medium text-neutral-700">{item.orders} orders</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Maintenance by Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
            >
              <h3 className="text-xl font-light text-neutral-900 mb-4">Maintenance by Category</h3>
              <div className="space-y-3">
                {stats.maintenance.byCategory.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex justify-between mb-1">
                      <span className="text-neutral-700">{cat.category}</span>
                      <span className="font-medium text-neutral-900">{cat.count}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${(cat.count / 70) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Attendance Section */}
      {selectedView === "attendance" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
            >
              <p className="text-sm font-light text-neutral-600 mb-2">Overall Attendance</p>
              <p className="text-4xl font-light text-neutral-900 mb-1">
                {stats.attendance.overall.percentage}%
              </p>
              <p className="text-sm text-neutral-500">
                {stats.attendance.overall.present} / {stats.attendance.overall.present + stats.attendance.overall.absent} students
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
            >
              <p className="text-sm font-light text-neutral-600 mb-2">Present Today</p>
              <p className="text-4xl font-light text-green-600">{stats.attendance.overall.present}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
            >
              <p className="text-sm font-light text-neutral-600 mb-2">Absent Today</p>
              <p className="text-4xl font-light text-red-600">{stats.attendance.overall.absent}</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
          >
            <h3 className="text-xl font-light text-neutral-900 mb-6">Branch-wise Attendance</h3>
            <div className="space-y-4">
              {stats.attendance.byBranch.map((branch) => {
                const percentage = ((branch.present / branch.total) * 100).toFixed(1);
                return (
                  <div key={branch.branch}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-neutral-900">{branch.branch}</span>
                      <span className="text-neutral-700">
                        {branch.present}/{branch.total} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Rooms Section */}
      {selectedView === "rooms" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
            >
              <p className="text-sm font-light text-neutral-600 mb-2">Total Rooms</p>
              <p className="text-4xl font-light text-neutral-900">{stats.rooms.overall.total}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
            >
              <p className="text-sm font-light text-neutral-600 mb-2">Occupied</p>
              <p className="text-4xl font-light text-blue-600">{stats.rooms.overall.occupied}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
            >
              <p className="text-sm font-light text-neutral-600 mb-2">Occupancy Rate</p>
              <p className="text-4xl font-light text-neutral-900">{stats.rooms.overall.occupancyRate}%</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
          >
            <h3 className="text-xl font-light text-neutral-900 mb-6">Branch-wise Occupancy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.rooms.byBranch.map((branch) => {
                const percentage = ((branch.occupied / branch.total) * 100).toFixed(1);
                return (
                  <div key={branch.branch} className="bg-neutral-50 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-neutral-900 text-lg">{branch.branch}</h4>
                      <span className="text-2xl font-light text-neutral-900">{percentage}%</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Total Rooms:</span>
                        <span className="font-medium text-neutral-900">{branch.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Occupied:</span>
                        <span className="font-medium text-blue-600">{branch.occupied}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Available:</span>
                        <span className="font-medium text-green-600">{branch.available}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-neutral-200 rounded-full overflow-hidden mt-3">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Fees Section */}
      {selectedView === "fees" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Total Students", value: stats.fees.total, color: "text-neutral-900" },
              { label: "Paid", value: stats.fees.paid, color: "text-green-600" },
              { label: "Partial", value: stats.fees.partial, color: "text-yellow-600" },
              { label: "Unpaid", value: stats.fees.unpaid, color: "text-red-600" },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
              >
                <p className="text-sm font-light text-neutral-600 mb-2">{item.label}</p>
                <p className={`text-4xl font-light ${item.color}`}>{item.value}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-neutral-200/50"
          >
            <h3 className="text-xl font-light text-neutral-900 mb-6">Fee Payment Breakdown</h3>
            <div className="space-y-6">
              {[
                { label: "Paid", value: stats.fees.paid, total: stats.fees.total, color: "from-green-500 to-emerald-500" },
                { label: "Partial", value: stats.fees.partial, total: stats.fees.total, color: "from-yellow-500 to-orange-500" },
                { label: "Unpaid", value: stats.fees.unpaid, total: stats.fees.total, color: "from-red-500 to-pink-500" },
              ].map((item) => {
                const percentage = ((item.value / item.total) * 100).toFixed(1);
                return (
                  <div key={item.label}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-neutral-900">{item.label}</span>
                      <span className="text-neutral-700">
                        {item.value} students ({percentage}%)
                      </span>
                    </div>
                    <div className="h-4 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
              <p className="text-sm text-neutral-600 mb-1">Collection Rate</p>
              <p className="text-3xl font-light text-neutral-900">{stats.fees.collectionRate}%</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Maintenance Section */}
      {selectedView === "maintenance" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
            >
              <h3 className="text-xl font-light text-neutral-900 mb-6">By Status</h3>
              <div className="space-y-4">
                {stats.maintenance.byStatus.map((item) => {
                  const total = stats.maintenance.byStatus.reduce((sum, s) => sum + s.count, 0);
                  const percentage = ((item.count / total) * 100).toFixed(1);
                  const colors: Record<string, string> = {
                    pending: "from-yellow-500 to-orange-500",
                    "in-progress": "from-blue-500 to-indigo-500",
                    completed: "from-green-500 to-emerald-500",
                    rejected: "from-red-500 to-pink-500",
                  };
                  return (
                    <div key={item.status}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-neutral-900 capitalize">{item.status}</span>
                        <span className="text-neutral-700">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colors[item.status]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
            >
              <h3 className="text-xl font-light text-neutral-900 mb-6">By Category</h3>
              <div className="space-y-4">
                {stats.maintenance.byCategory.map((item) => {
                  const total = stats.maintenance.byCategory.reduce((sum, c) => sum + c.count, 0);
                  const percentage = ((item.count / total) * 100).toFixed(1);
                  return (
                    <div key={item.category}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-neutral-900">{item.category}</span>
                        <span className="text-neutral-700">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
          >
            <h3 className="text-xl font-light text-neutral-900 mb-6">Monthly Trends</h3>
            <div className="flex items-end justify-between gap-4 h-64">
              {stats.maintenance.trends.map((item, index) => {
                const maxCount = Math.max(...stats.maintenance.trends.map((t) => t.count));
                const height = (item.count / maxCount) * 100;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-neutral-100 rounded-t-2xl relative" style={{ height: `${height}%`, minHeight: "20px" }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-2xl" />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm font-medium text-neutral-900">
                        {item.count}
                      </div>
                    </div>
                    <span className="text-sm text-neutral-600">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Food Section */}
      {selectedView === "food" && (
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
          >
            <h3 className="text-xl font-light text-neutral-900 mb-2">Total Revenue</h3>
            <p className="text-4xl font-light text-green-600">Rs {stats.food.revenue.toLocaleString()}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
            >
              <h3 className="text-xl font-light text-neutral-900 mb-6">Top Menu Items</h3>
              <div className="space-y-4">
                {stats.food.topItems.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">{item.name}</p>
                      <p className="text-sm text-neutral-600">{item.orders} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
            >
              <h3 className="text-xl font-light text-neutral-900 mb-6">Orders by Category</h3>
              <div className="space-y-4">
                {stats.food.byCategory.map((item) => {
                  const total = stats.food.byCategory.reduce((sum, c) => sum + c.orders, 0);
                  const percentage = ((item.orders / total) * 100).toFixed(1);
                  const colors: Record<string, string> = {
                    Breakfast: "from-yellow-500 to-orange-500",
                    Lunch: "from-green-500 to-emerald-500",
                    Dinner: "from-purple-500 to-pink-500",
                    Snacks: "from-blue-500 to-cyan-500",
                  };
                  return (
                    <div key={item.category}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-neutral-900">{item.category}</span>
                        <span className="text-neutral-700">
                          {item.orders} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colors[item.category]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
