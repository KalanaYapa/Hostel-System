"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { motion } from "framer-motion";

interface MaintenanceRequest {
  requestId: string;
  issue: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "rejected";
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export default function MaintenancePage() {
  const router = useRouter();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    issue: "",
    description: "",
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/student/maintenance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/student/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Maintenance request submitted successfully!");
        setFormData({ issue: "", description: "" });
        setShowForm(false);
        fetchRequests();
      } else {
        alert(data.error || "Failed to submit request");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout type="student" title="Maintenance Requests" subtitle="Submit and track maintenance issues">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* New Request Button */}
        <div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-lg font-semibold transition-all duration-200"
          >
            {showForm ? "Cancel" : "+ New Maintenance Request"}
          </button>
        </div>

        {/* Request Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-neutral-200/50"
          >
            <h2 className="text-2xl font-light tracking-tight mb-6">Submit New Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Type
                </label>
                <select
                  value={formData.issue}
                  onChange={(e) =>
                    setFormData({ ...formData, issue: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                  required
                >
                  <option value="">Select issue type</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="AC/Heating">AC/Heating</option>
                  <option value="Internet">Internet/WiFi</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                  placeholder="Please describe the issue in detail..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </motion.div>
        )}

        {/* Requests List */}
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-neutral-200/50">
          <h2 className="text-2xl font-light tracking-tight mb-6">My Requests</h2>

          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-gray-600">No maintenance requests yet</p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <motion.div
                  key={request.requestId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 bg-white/40"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{request.issue}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(request.createdAt).toLocaleDateString()} at{" "}
                        {new Date(request.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm rounded-full capitalize ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{request.description}</p>
                  <p className="text-xs text-gray-500">ID: {request.requestId}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
