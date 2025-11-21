"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AdminSidebar from "@/app/components/AdminSidebar";
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

interface Stats {
  totalStudents: number;
  activeStudents: number;
  totalRooms: number;
  occupiedRooms: number;
  pendingMaintenance: number;
  pendingOrders: number;
  paidFees: number;
  unpaidFees: number;
  totalCapacity: number;
  totalOccupied: number;
  occupancyRate: number;
}

interface ChartData {
  roomsByBranch: Array<{
    name: string;
    totalRooms: number;
    occupiedRooms: number;
    capacity: number;
    occupied: number;
    available: number;
  }>;
  studentsByBranch: Array<{
    name: string;
    total: number;
    active: number;
    inactive: number;
  }>;
  feeStatus: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  maintenanceByStatus: Array<{
    name: string;
    value: number;
  }>;
  ordersByStatus: Array<{
    name: string;
    value: number;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    activeStudents: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    pendingMaintenance: 0,
    pendingOrders: 0,
    paidFees: 0,
    unpaidFees: 0,
    totalCapacity: 0,
    totalOccupied: 0,
    occupancyRate: 0,
  });
  const [chartData, setChartData] = useState<ChartData>({
    roomsByBranch: [],
    studentsByBranch: [],
    feeStatus: [],
    maintenanceByStatus: [],
    ordersByStatus: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cookies are sent automatically
    const userType = localStorage.getItem("userType");

    if (userType !== "admin") {
      router.push("/admin/login");
      return;
    }

    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      // Cookies are sent automatically
      const response = await fetch("/api/admin/stats");

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
        setChartData(data.chartData || chartData);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userType");
    router.push("/admin/login");
  };

  // Colors for charts
  const COLORS = {
    primary: ["#3b82f6", "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b"],
    pie: {
      paid: "#10b981",
      unpaid: "#ef4444",
      pending: "#f59e0b",
      inProgress: "#3b82f6",
      completed: "#10b981",
      cancelled: "#6b7280",
    },
  };

  const statsCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      subtitle: `${stats.activeStudents} active`,
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Rooms",
      value: stats.totalRooms,
      subtitle: `${stats.occupiedRooms} occupied`,
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Maintenance",
      value: stats.pendingMaintenance,
      subtitle: "Pending requests",
      icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Fee Status",
      value: stats.paidFees,
      subtitle: `${stats.unpaidFees} unpaid`,
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const menuItems = [
    {
      title: "Students",
      description: "Manage student accounts and assignments",
      href: "/admin/dashboard/students",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Rooms & Branches",
      description: "Manage hostel rooms and branch assignments",
      href: "/admin/dashboard/rooms",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Fees Management",
      description: "Configure yearly hostel fees",
      href: "/admin/dashboard/fees",
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Maintenance",
      description: "View and manage maintenance requests",
      href: "/admin/dashboard/maintenance",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
      color: "from-orange-500 to-yellow-500",
    },
    {
      title: "Food Menu",
      description: "Manage food menu and orders",
      href: "/admin/dashboard/food",
      icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
      color: "from-teal-500 to-cyan-500",
    },
    {
      title: "Emergency",
      description: "Manage emergency contact information",
      href: "/admin/dashboard/emergency",
      icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
      color: "from-red-500 to-pink-500",
    },
    {
      title: "Statistics",
      description: "View attendance and branch statistics",
      href: "/admin/dashboard/statistics",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      color: "from-indigo-500 to-purple-500",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-light text-neutral-900"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 transition-colors duration-500">
      <AdminSidebar onLogout={handleLogout} />

      {/* Main Content with Sidebar Offset */}
      <div className="lg:pl-[280px] transition-all duration-300">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-xl border-b border-neutral-200/50 transition-all duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-light tracking-tight text-neutral-900"
                >
                  Admin Dashboard
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-base font-light text-neutral-600 mt-1"
                >
                  Hostel Management System
                </motion.p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-light text-neutral-600">
                  {stat.title}
                </h3>
                <div
                  className={`h-12 w-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={stat.icon}
                    />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-light text-neutral-900 mb-2">
                {stat.value}
              </p>
              <p className="text-sm font-light text-neutral-500">
                {stat.subtitle}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="space-y-8 mb-12">
          {/* Row 1: Room Occupancy and Students by Branch */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Room Occupancy by Branch */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-neutral-200/50"
            >
              <h3 className="text-xl font-light tracking-tight text-neutral-900 mb-6">
                Room Occupancy by Branch
              </h3>
              {chartData.roomsByBranch.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.roomsByBranch}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: "12px" }} />
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
                    <Bar dataKey="occupied" fill="#3b82f6" name="Occupied" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="available" fill="#10b981" name="Available" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-neutral-500">
                  No data available
                </div>
              )}
            </motion.div>

            {/* Students by Branch */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-neutral-200/50"
            >
              <h3 className="text-xl font-light tracking-tight text-neutral-900 mb-6">
                Students by Branch
              </h3>
              {chartData.studentsByBranch.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.studentsByBranch}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: "12px" }} />
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
                    <Bar dataKey="active" fill="#06b6d4" name="Active" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="inactive" fill="#6b7280" name="Inactive" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-neutral-500">
                  No data available
                </div>
              )}
            </motion.div>
          </div>

          {/* Row 2: Fee Status, Maintenance, and Orders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Fee Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-neutral-200/50"
            >
              <h3 className="text-xl font-light tracking-tight text-neutral-900 mb-6">
                Fee Payment Status
              </h3>
              {chartData.feeStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData.feeStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.feeStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.name === "Paid" ? COLORS.pie.paid : COLORS.pie.unpaid}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-neutral-500">
                  No data available
                </div>
              )}
            </motion.div>

            {/* Maintenance Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-neutral-200/50"
            >
              <h3 className="text-xl font-light tracking-tight text-neutral-900 mb-6">
                Maintenance Requests
              </h3>
              {chartData.maintenanceByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData.maintenanceByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.maintenanceByStatus.map((entry, index) => {
                        const colorMap: Record<string, string> = {
                          Pending: COLORS.pie.pending,
                          "In Progress": COLORS.pie.inProgress,
                          Completed: COLORS.pie.completed,
                          Cancelled: COLORS.pie.cancelled,
                        };
                        return (
                          <Cell key={`cell-${index}`} fill={colorMap[entry.name] || COLORS.primary[index % COLORS.primary.length]} />
                        );
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-neutral-500">
                  No data available
                </div>
              )}
            </motion.div>

            {/* Food Orders Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-neutral-200/50"
            >
              <h3 className="text-xl font-light tracking-tight text-neutral-900 mb-6">
                Food Orders Status
              </h3>
              {chartData.ordersByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData.ordersByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.ordersByStatus.map((entry, index) => {
                        const colorMap: Record<string, string> = {
                          Pending: COLORS.pie.pending,
                          Completed: COLORS.pie.completed,
                          Cancelled: COLORS.pie.cancelled,
                        };
                        return (
                          <Cell key={`cell-${index}`} fill={colorMap[entry.name] || COLORS.primary[index % COLORS.primary.length]} />
                        );
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-neutral-500">
                  No data available
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(item.href)}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-neutral-200/50 transition-all duration-500 hover:shadow-3xl cursor-pointer group"
            >
              <div
                className={`h-16 w-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={item.icon}
                  />
                </svg>
              </div>
              <h3 className="text-xl font-light tracking-tight text-neutral-900 mb-2">
                {item.title}
              </h3>
              <p className="text-neutral-600 font-light text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
        </main>
      </div>
    </div>
  );
}
