"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 transition-colors duration-500">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-neutral-900 mb-6">
              Hostel Management System
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 font-light mb-16">
              Sabaragamuwa University of Sri Lanka
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Student Portal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/student/login">
                <div className="bg-white/60 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border border-neutral-200/50 transition-all duration-500 hover:shadow-3xl cursor-pointer group">
                  <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg
                      className="h-10 w-10 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-light tracking-tight text-neutral-900 mb-3">
                    Student Portal
                  </h2>
                  <p className="text-neutral-600 font-light leading-relaxed">
                    Access your hostel information, manage payments, and track your stay with ease
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Admin Portal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/admin/login">
                <div className="bg-white/60 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border border-neutral-200/50 transition-all duration-500 hover:shadow-3xl cursor-pointer group">
                  <div className="mx-auto h-20 w-20 bg-black rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg
                      className="h-10 w-10 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-light tracking-tight text-neutral-900 mb-3">
                    Admin Portal
                  </h2>
                  <p className="text-neutral-600 font-light leading-relaxed">
                    Manage students, rooms, maintenance requests, and streamline operations
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16"
          >
            <p className="text-neutral-500 text-sm font-light">
              © {new Date().getFullYear()} SPACE SOLUTIONS INTERNATIONAL (PVT) LTD. All rights reserved.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
