"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import StudentSidebar from "@/app/components/StudentSidebar";

interface StudentData {
  studentId: string;
  name: string;
  email: string;
  phone: string;
  branch?: string;
  roomNumber?: string;
  feesPaid: boolean;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cookies are sent automatically
    const userType = localStorage.getItem("userType");
    const storedData = localStorage.getItem("studentData");

    if (userType !== "student") {
      router.push("/student/login");
      return;
    }

    if (storedData) {
      setStudentData(JSON.parse(storedData));
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userType");
    localStorage.removeItem("studentData");
    router.push("/student/login");
  };

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

  if (!studentData) {
    return null;
  }

  const quickActions = [
    {
      title: "Hostel Fees",
      description: "View and pay your hostel fees",
      href: "/student/dashboard/fees",
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "from-green-500 to-emerald-500",
      badge: !studentData.feesPaid,
    },
    {
      title: "Maintenance",
      description: "Submit and track maintenance requests",
      href: "/student/dashboard/maintenance",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Food Orders",
      description: "Browse menu and place food orders",
      href: "/student/dashboard/food",
      icon: "M12 6v6m0 0v6m0-6h6m-6 0H6",
      color: "from-orange-500 to-yellow-500",
    },
    {
      title: "Emergency",
      description: "Access medical, transport, and security contacts",
      href: "/student/dashboard/emergency",
      icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
      color: "from-red-500 to-pink-500",
    },
    {
      title: "Attendance",
      description: "Mark your daily attendance and view history",
      href: "/student/dashboard/attendance",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
      color: "from-purple-500 to-indigo-500",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 transition-colors duration-500">
      <StudentSidebar studentName={studentData.name} onLogout={handleLogout} />

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
                  Student Dashboard
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-base font-light text-neutral-600 mt-1"
                >
                  Welcome back, {studentData.name}
                </motion.p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Student Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-neutral-200/50 mb-12"
        >
          <h2 className="text-2xl font-light tracking-tight text-neutral-900 mb-6">
            My Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: "Student ID", value: studentData.studentId },
              { label: "Name", value: studentData.name },
              { label: "Email", value: studentData.email },
              { label: "Phone", value: studentData.phone },
              {
                label: "Branch",
                value: studentData.branch || "Default",
              },
              {
                label: "Room Number",
                value: studentData.roomNumber || "Default",
              },
              {
                label: "Fee Status",
                value: studentData.feesPaid ? (
                  <span className="px-3 py-1 rounded-full text-sm bg-green-500/10 text-green-600 font-medium">
                    Paid
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-sm bg-red-500/10 text-red-600 font-medium">
                    Pending
                  </span>
                ),
              },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <p className="text-sm font-light text-neutral-500 mb-1">
                  {item.label}
                </p>
                <p className="text-base font-medium text-neutral-900">
                  {item.value}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(action.href)}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-neutral-200/50 transition-all duration-500 hover:shadow-3xl cursor-pointer group relative"
            >
              {action.badge && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 px-3 py-1 bg-red-500/10 text-red-600 text-xs rounded-full font-medium border border-red-500/20"
                >
                  Action Needed
                </motion.div>
              )}
              <div
                className={`h-16 w-16 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
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
                    d={action.icon}
                  />
                </svg>
              </div>
              <h3 className="text-xl font-light tracking-tight text-neutral-900 mb-2">
                {action.title}
              </h3>
              <p className="text-neutral-600 font-light text-sm leading-relaxed">
                {action.description}
              </p>
            </motion.div>
          ))}
        </div>
        </main>
      </div>
    </div>
  );
}
