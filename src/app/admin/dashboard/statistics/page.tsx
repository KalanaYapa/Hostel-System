"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
  const [error, setError] = useState<string | null>(null);
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
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to load statistics");
        console.error("API Error:", errorData);
      }
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  // Chart colors
  const COLORS = {
    primary: ["#3b82f6", "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b"],
    attendance: { present: "#10b981", absent: "#ef4444" },
    rooms: { occupied: "#3b82f6", available: "#10b981" },
    fees: { paid: "#10b981", partial: "#f59e0b", unpaid: "#ef4444" },
    maintenance: {
      pending: "#f59e0b",
      "in-progress": "#3b82f6",
      completed: "#10b981",
      cancelled: "#6b7280",
      rejected: "#ef4444",
    },
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

  if (error || !stats) {
    return (
      <DashboardLayout type="admin" title="Statistics & Analytics" subtitle="View comprehensive hostel statistics">
        <div className="text-center py-12">
          <p className="text-red-600 font-medium mb-2">Failed to load statistics</p>
          {error && <p className="text-neutral-600 text-sm">{error}</p>}
          <button
            onClick={fetchStatistics}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
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
            {stats.attendance.byBranch.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.attendance.byBranch}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="branch" stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "12px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="present" fill={COLORS.attendance.present} name="Present" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="absent" fill={COLORS.attendance.absent} name="Absent" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-neutral-500">
                No attendance data available
              </div>
            )}
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
            {stats.rooms.byBranch.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.rooms.byBranch}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="branch" stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "12px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="occupied" fill={COLORS.rooms.occupied} name="Occupied" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="available" fill={COLORS.rooms.available} name="Available" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-neutral-500">
                No room data available
              </div>
            )}
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
            {stats.fees.total > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Paid", value: stats.fees.paid },
                        { name: "Partial", value: stats.fees.partial },
                        { name: "Unpaid", value: stats.fees.unpaid },
                      ].filter((item) => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={COLORS.fees.paid} />
                      <Cell fill={COLORS.fees.partial} />
                      <Cell fill={COLORS.fees.unpaid} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col justify-center space-y-4">
                  {[
                    { label: "Paid", value: stats.fees.paid, color: COLORS.fees.paid },
                    { label: "Partial", value: stats.fees.partial, color: COLORS.fees.partial },
                    { label: "Unpaid", value: stats.fees.unpaid, color: COLORS.fees.unpaid },
                  ].map((item) => {
                    const percentage = ((item.value / stats.fees.total) * 100).toFixed(1);
                    return (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="font-medium text-neutral-900">{item.label}</span>
                        </div>
                        <span className="text-neutral-700">
                          {item.value} ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
                  <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                    <p className="text-sm text-neutral-600 mb-1">Collection Rate</p>
                    <p className="text-3xl font-light text-neutral-900">{stats.fees.collectionRate}%</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-neutral-500">
                No fee data available
              </div>
            )}
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
              {stats.maintenance.byStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats.maintenance.byStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, count }) => `${status}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                    >
                      {stats.maintenance.byStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS.maintenance[entry.status as keyof typeof COLORS.maintenance] || COLORS.primary[index % COLORS.primary.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-neutral-500">
                  No maintenance data available
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
            >
              <h3 className="text-xl font-light text-neutral-900 mb-6">By Category</h3>
              {stats.maintenance.byCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.maintenance.byCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#6b7280" style={{ fontSize: "12px" }} />
                    <YAxis type="category" dataKey="category" stroke="#6b7280" style={{ fontSize: "12px" }} width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-neutral-500">
                  No category data available
                </div>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
          >
            <h3 className="text-xl font-light text-neutral-900 mb-6">Monthly Trends</h3>
            {stats.maintenance.trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.maintenance.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "12px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    name="Requests"
                    dot={{ fill: "#8b5cf6", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-neutral-500">
                No trend data available
              </div>
            )}
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
              {stats.food.byCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats.food.byCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, orders }) => `${category}: ${orders}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="orders"
                      nameKey="category"
                    >
                      {stats.food.byCategory.map((entry, index) => {
                        const colors: Record<string, string> = {
                          Breakfast: "#f59e0b",
                          Lunch: "#10b981",
                          Dinner: "#8b5cf6",
                          Snacks: "#06b6d4",
                        };
                        return (
                          <Cell key={`cell-${index}`} fill={colors[entry.category] || COLORS.primary[index % COLORS.primary.length]} />
                        );
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-neutral-500">
                  No food category data available
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
