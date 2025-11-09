"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface StudentSidebarProps {
  studentName?: string;
  onLogout: () => void;
}

export default function StudentSidebar({ studentName, onLogout }: StudentSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/student/dashboard",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      name: "Hostel Fees",
      href: "/student/dashboard/fees",
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      name: "Maintenance",
      href: "/student/dashboard/maintenance",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    },
    {
      name: "Food Orders",
      href: "/student/dashboard/food",
      icon: "M12 6v6m0 0v6m0-6h6m-6 0H6",
    },
    {
      name: "Emergency",
      href: "/student/dashboard/emergency",
      icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    },
    {
      name: "Attendance",
      href: "/student/dashboard/attendance",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-18 px-4 border-b border-neutral-200/50">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          {!isCollapsed && (
            <span className="text-xl font-light tracking-tight text-neutral-900 truncate">
              Student
            </span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:block p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} onClick={() => setIsMobileOpen(false)}>
              <motion.div
                whileHover={{ x: isCollapsed ? 0 : 4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-black/10 text-black backdrop-blur-sm border border-black/20 shadow-lg"
                    : "text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-900"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.name : undefined}
              >
                <svg
                  className={`flex-shrink-0 h-5 w-5 transition-all duration-300 ${
                    isActive ? "text-black" : "text-neutral-500"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="flex-shrink-0 p-4 border-t border-neutral-200/50">
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <div className={`flex items-center ${isCollapsed ? "" : "flex-1 min-w-0"}`}>
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-medium text-sm">
              {studentName ? studentName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "S"}
            </div>
            {!isCollapsed && (
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {studentName || "Student"}
                </p>
                <p className="text-xs font-light text-neutral-500 truncate">Student Portal</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <motion.button
              onClick={onLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg text-neutral-600 hover:text-red-600 hover:bg-red-500/10 transition-all duration-200"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white shadow-lg border border-neutral-200"
      >
        <svg className="w-6 h-6 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-xl border-r border-neutral-200/50 shadow-2xl z-40 lg:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 left-0 bg-white/95 backdrop-blur-xl border-r border-neutral-200/50 transition-colors duration-500 overflow-hidden z-30"
      >
        <SidebarContent />
      </motion.div>
    </>
  );
}
