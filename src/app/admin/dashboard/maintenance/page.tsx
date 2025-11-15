"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";

interface MaintenanceRequest {
  requestId: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  branch: string;
  category: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "rejected";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
}

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBranch, setFilterBranch] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");

  const branches = ["CS", "ECE", "ME", "CE", "EE"];
  const statuses = ["pending", "in-progress", "completed", "rejected"];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/maintenance", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      } else {
        // Mock data for development
        setRequests([
          {
            requestId: "1",
            studentId: "S001",
            studentName: "John Doe",
            roomNumber: "101",
            branch: "CS",
            category: "Electrical",
            description: "Fan not working properly, making noise",
            status: "pending",
            priority: "high",
            createdAt: "2025-11-08T10:30:00",
            updatedAt: "2025-11-08T10:30:00",
          },
          {
            requestId: "2",
            studentId: "S002",
            studentName: "Jane Smith",
            roomNumber: "205",
            branch: "ECE",
            category: "Plumbing",
            description: "Water leakage from bathroom tap",
            status: "in-progress",
            priority: "medium",
            createdAt: "2025-11-07T14:20:00",
            updatedAt: "2025-11-08T09:00:00",
            adminNotes: "Technician assigned, will be fixed today",
          },
          {
            requestId: "3",
            studentId: "S003",
            studentName: "Mike Johnson",
            roomNumber: "302",
            branch: "ME",
            category: "Furniture",
            description: "Broken chair needs replacement",
            status: "completed",
            priority: "low",
            createdAt: "2025-11-06T11:15:00",
            updatedAt: "2025-11-07T16:30:00",
            adminNotes: "New chair provided",
          },
          {
            requestId: "4",
            studentId: "S004",
            studentName: "Sarah Williams",
            roomNumber: "108",
            branch: "CS",
            category: "Electrical",
            description: "No power in room since morning",
            status: "pending",
            priority: "high",
            createdAt: "2025-11-09T08:00:00",
            updatedAt: "2025-11-09T08:00:00",
          },
          {
            requestId: "5",
            studentId: "S005",
            studentName: "David Brown",
            roomNumber: "210",
            branch: "EE",
            category: "Cleaning",
            description: "Room deep cleaning required",
            status: "rejected",
            priority: "low",
            createdAt: "2025-11-05T16:45:00",
            updatedAt: "2025-11-06T10:00:00",
            adminNotes: "Not a maintenance issue, contact housekeeping",
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, studentId: string, status: string, notes: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/maintenance", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId,
          studentId,
          status,
          adminNotes: notes
        }),
      });

      if (response.ok) {
        alert("Request updated successfully!");
        setShowDetailModal(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        const error = await response.json();
        alert(`Failed to update request: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update request");
    }
  };

  const openDetailModal = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setAdminNotes(request.adminNotes || "");
    setShowDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "in-progress":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-neutral-500/10 text-neutral-600 border-neutral-500/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      default:
        return "bg-neutral-500/10 text-neutral-600 border-neutral-500/20";
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    const matchesBranch = filterBranch === "all" || request.branch === filterBranch;
    return matchesStatus && matchesBranch;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    inProgress: requests.filter((r) => r.status === "in-progress").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  return (
    <DashboardLayout type="admin" title="Maintenance Management" subtitle="Manage student maintenance requests">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Requests", value: stats.total, color: "from-blue-500 to-cyan-500" },
          { label: "Pending", value: stats.pending, color: "from-yellow-500 to-orange-500" },
          { label: "In Progress", value: stats.inProgress, color: "from-blue-500 to-indigo-500" },
          { label: "Completed", value: stats.completed, color: "from-green-500 to-emerald-500" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
          >
            <p className="text-sm font-light text-neutral-600 mb-2">{stat.label}</p>
            <p className="text-4xl font-light text-neutral-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50 mb-8"
      >
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
          >
            <option value="all">All Status</option>
            {statuses.map((status) => (
              <option key={status} value={status} className="capitalize">
                {status}
              </option>
            ))}
          </select>

          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
          >
            <option value="all">All Branches</option>
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Requests Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-neutral-600">Loading requests...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request, index) => (
            <motion.div
              key={request.requestId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50 hover:shadow-3xl transition-all cursor-pointer"
              onClick={() => openDetailModal(request)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-light text-neutral-900">{request.category}</h3>
                  <p className="text-sm text-neutral-600">Room {request.roomNumber}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Student:</span>
                  <span className="font-medium text-neutral-900">{request.studentName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Branch:</span>
                  <span className="font-medium text-neutral-900">{request.branch}</span>
                </div>
                <div className="text-sm">
                  <p className="text-neutral-600 mb-1">Description:</p>
                  <p className="text-neutral-900 line-clamp-2">{request.description}</p>
                </div>
                <div className="text-xs text-neutral-500 pt-2">
                  {new Date(request.createdAt).toLocaleString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-light text-neutral-900 mb-6">
                Maintenance Request Details
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-neutral-600">Category</p>
                    <p className="text-lg font-medium text-neutral-900">{selectedRequest.category}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedRequest.priority)}`}>
                      {selectedRequest.priority} priority
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600">Student Name</p>
                    <p className="font-medium text-neutral-900">{selectedRequest.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Student ID</p>
                    <p className="font-medium text-neutral-900">{selectedRequest.studentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Room Number</p>
                    <p className="font-medium text-neutral-900">{selectedRequest.roomNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Branch</p>
                    <p className="font-medium text-neutral-900">{selectedRequest.branch}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-neutral-600 mb-2">Description</p>
                  <p className="text-neutral-900 bg-neutral-50 p-4 rounded-2xl">
                    {selectedRequest.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600">Created At</p>
                    <p className="text-sm text-neutral-900">
                      {new Date(selectedRequest.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Last Updated</p>
                    <p className="text-sm text-neutral-900">
                      {new Date(selectedRequest.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Update Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status} className="capitalize">
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Admin Notes / Comments
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20 resize-none"
                    placeholder="Add notes about the request or actions taken..."
                  />
                </div>

                {selectedRequest.adminNotes && (
                  <div>
                    <p className="text-sm text-neutral-600 mb-2">Previous Notes</p>
                    <p className="text-sm text-neutral-700 bg-blue-50 p-4 rounded-2xl">
                      {selectedRequest.adminNotes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-2xl transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedRequest.requestId, selectedRequest.studentId, newStatus, adminNotes)}
                  className="flex-1 px-4 py-3 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-lg transition-all font-medium"
                >
                  Update Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
