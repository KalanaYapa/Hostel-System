"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";
import { toast } from "sonner";

interface LatePassRequest {
  requestId: string;
  requestedDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvalNotes?: string;
  approvedAt?: string;
}

export default function LatePassPage() {
  const [requests, setRequests] = useState<LatePassRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    requestedDate: "",
    startTime: "",
    endTime: "",
    reason: "",
    description: "",
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/student/late-pass", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch requests");

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load late pass requests");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/student/late-pass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit request");
      }

      toast.success("Late pass request submitted successfully!");
      setFormData({
        requestedDate: "",
        startTime: "",
        endTime: "",
        reason: "",
        description: "",
      });
      setShowForm(false);
      fetchRequests();
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast.error(error.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "from-green-500 to-emerald-500";
      case "rejected":
        return "from-red-500 to-pink-500";
      case "pending":
        return "from-yellow-500 to-orange-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  return (
    <DashboardLayout type="student">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Late Pass Requests
            </h1>
            <p className="text-neutral-600">
              Request permission to return late to the hostel
            </p>
          </motion.div>

          {/* New Request Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-lg font-semibold transition-all duration-200"
            >
              {showForm ? "Cancel" : "+ New Late Pass Request"}
            </button>
          </motion.div>

          {/* Request Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-neutral-200/50 relative"
            >
              <h2 className="text-2xl font-bold text-neutral-800 mb-6">
                Submit Late Pass Request
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.requestedDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requestedDate: e.target.value,
                        })
                      }
                      min={new Date().toISOString().split("T")[0]}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white relative z-10"
                    />
                  </div>

                  {/* Reason */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Reason <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white relative z-10"
                    >
                      <option value="">Select Reason</option>
                      <option value="personal">Personal</option>
                      <option value="medical">Medical</option>
                      <option value="family">Family Emergency</option>
                      <option value="academic">Academic Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Start Time */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Departure Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white relative z-10"
                    />
                  </div>

                  {/* End Time */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Expected Return Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white relative z-10"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    required
                    placeholder="Please provide detailed reason for late return..."
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none relative z-10"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-lg disabled:opacity-50 font-semibold transition-all duration-200"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            </motion.div>
          )}

          {/* Request History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-neutral-200/50"
          >
            <h2 className="text-2xl font-bold text-neutral-800 mb-6">
              Request History
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-500">No late pass requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request, index) => (
                  <motion.div
                    key={request.requestId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/80 rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-neutral-800 capitalize">
                          {request.reason}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {formatDate(request.requestedDate)}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusTextColor(
                          request.status
                        )} bg-white border-2 border-current`}
                      >
                        {request.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">
                          Departure
                        </p>
                        <p className="font-semibold text-neutral-800">
                          {formatTime(request.startTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Return</p>
                        <p className="font-semibold text-neutral-800">
                          {formatTime(request.endTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">
                          Submitted
                        </p>
                        <p className="font-semibold text-neutral-800">
                          {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-neutral-600">
                        {request.description}
                      </p>
                    </div>

                    {request.approvalNotes && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-xs text-blue-600 font-semibold mb-1">
                          Admin Notes
                        </p>
                        <p className="text-sm text-neutral-700">
                          {request.approvalNotes}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
