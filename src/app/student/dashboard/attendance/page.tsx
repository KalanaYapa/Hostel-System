"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { motion } from "framer-motion";
import { toastMessages } from "@/lib/toast-messages";

interface AttendanceRecord {
  date: string;
  present: boolean;
  checkInTime?: string;
  checkOutTime?: string;
}

export default function AttendancePage() {
  const router = useRouter();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [todayMarked, setTodayMarked] = useState(false);
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    const studentData = localStorage.getItem("studentData");

    if (studentData) {
      const data = JSON.parse(studentData);
      setStudentName(data.name);
    }

    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      // Cookies are sent automatically
      const response = await fetch("/api/student/attendance");

      if (response.ok) {
        const data = await response.json();
        setAttendance(data.attendance || []);

        // Check if today's attendance is marked
        const today = new Date().toISOString().split("T")[0];
        const todayRecord = data.attendance.find(
          (a: AttendanceRecord) => a.date === today
        );
        setTodayMarked(!!todayRecord);
      } else {
        toastMessages.attendance.fetchError();
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
      toastMessages.attendance.fetchError();
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    setMarking(true);

    try {
      // Cookies are sent automatically
      const response = await fetch("/api/student/attendance", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        toastMessages.attendance.markSuccess();
        setTodayMarked(true);
        fetchAttendance();
      } else {
        toastMessages.attendance.markError();
      }
    } catch (error) {
      console.error("Mark attendance error:", error);
      toastMessages.attendance.markError();
    } finally {
      setMarking(false);
    }
  };

  const getAttendanceStats = () => {
    const totalDays = attendance.length;
    const presentDays = attendance.filter((a) => a.present).length;
    const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    return { totalDays, presentDays, percentage };
  };

  const stats = getAttendanceStats();

  return (
    <DashboardLayout type="student" title="Mark Attendance" subtitle="Track your daily attendance">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mark Attendance Card */}
          <div className="lg:col-span-2">
            <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-neutral-200/50 mb-6">
              <h2 className="text-2xl font-light tracking-tight mb-6">Today's Attendance</h2>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600">Current Date</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center">
                    <svg
                      className="h-8 w-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                <p className="text-gray-700 mb-1">
                  Current Time:{" "}
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              </div>

              {todayMarked ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                  <svg
                    className="h-16 w-16 text-green-600 mx-auto mb-4"
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
                  <h3 className="text-xl font-bold text-green-900 mb-2">
                    Attendance Marked!
                  </h3>
                  <p className="text-green-700">
                    Your attendance for today has been recorded.
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    Check-in time:{" "}
                    {attendance.find(
                      (a) => a.date === new Date().toISOString().split("T")[0]
                    )?.checkInTime &&
                      new Date(
                        attendance.find(
                          (a) =>
                            a.date === new Date().toISOString().split("T")[0]
                        )!.checkInTime!
                      ).toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleMarkAttendance}
                  disabled={marking}
                  className="w-full py-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-all duration-200"
                >
                  {marking ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-3"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Marking Attendance...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg
                        className="h-6 w-6 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Mark Attendance Now
                    </span>
                  )}
                </button>
              )}

              <p className="text-xs text-gray-500 text-center mt-4">
                Attendance can only be marked once per day
              </p>
            </div>

            {/* Attendance History */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-neutral-200/50">
              <h2 className="text-2xl font-light tracking-tight mb-6">
                Attendance History
              </h2>

              {loading ? (
                <p className="text-gray-600">Loading...</p>
              ) : attendance.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No attendance records yet
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {attendance
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((record) => (
                      <motion.div
                        key={record.date}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-between items-center p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-200 bg-white/40"
                      >
                        <div>
                          <p className="font-semibold">
                            {new Date(record.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          {record.checkInTime && (
                            <p className="text-xs text-gray-600">
                              Check-in:{" "}
                              {new Date(
                                record.checkInTime
                              ).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            record.present
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {record.present ? "Present" : "Absent"}
                        </span>
                      </motion.div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Statistics Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-neutral-200/50 sticky top-4">
              <h2 className="text-2xl font-light tracking-tight mb-6">
                Attendance Statistics
              </h2>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-2xl p-4">
                  <p className="text-sm text-blue-600 font-medium">
                    Total Days
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {stats.totalDays}
                  </p>
                </div>

                <div className="bg-green-50 rounded-2xl p-4">
                  <p className="text-sm text-green-600 font-medium">
                    Days Present
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {stats.presentDays}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-2xl p-4">
                  <p className="text-sm text-purple-600 font-medium">
                    Attendance %
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {stats.percentage.toFixed(1)}%
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-500"
                      style={{ width: `${stats.percentage}%` }}
                    ></div>
                  </div>
                </div>

                {stats.percentage >= 75 ? (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-3 mt-4">
                    <p className="text-sm text-green-800 font-semibold">
                      Great Job! 🎉
                    </p>
                    <p className="text-xs text-green-700">
                      Your attendance is excellent!
                    </p>
                  </div>
                ) : stats.percentage >= 50 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 mt-4">
                    <p className="text-sm text-yellow-800 font-semibold">
                      Keep Going! 💪
                    </p>
                    <p className="text-xs text-yellow-700">
                      Try to improve your attendance
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-3 mt-4">
                    <p className="text-sm text-red-800 font-semibold">
                      Attention Needed! ⚠️
                    </p>
                    <p className="text-xs text-red-700">
                      Your attendance is below requirements
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
