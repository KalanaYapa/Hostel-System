"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";
import { toastMessages } from "@/lib/toast-messages";
import jsPDF from "jspdf";

interface LatePassRequest {
  requestId: string;
  studentId: string;
  studentName: string;
  branch: string;
  roomNumber: string;
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

export default function AdminLatePassPage() {
  const [requests, setRequests] = useState<LatePassRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LatePassRequest[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<LatePassRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, statusFilter, branchFilter]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/late-pass", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch requests");

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toastMessages.latePass.fetchError();
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    if (statusFilter !== "all") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    if (branchFilter !== "all") {
      filtered = filtered.filter((req) => req.branch === branchFilter);
    }

    setFilteredRequests(filtered);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !newStatus) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/late-pass", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId: selectedRequest.requestId,
          studentId: selectedRequest.studentId,
          status: newStatus,
          approvalNotes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update request");
      }

      if (newStatus === "approved") {
        toastMessages.latePass.approveSuccess(selectedRequest?.studentName);
      } else if (newStatus === "rejected") {
        toastMessages.latePass.rejectSuccess(selectedRequest?.studentName);
      } else {
        toastMessages.latePass.updateSuccess?.(newStatus) || toastMessages.general.saveSuccess();
      }
      setShowDetailModal(false);
      setSelectedRequest(null);
      setNewStatus("");
      setApprovalNotes("");
      fetchRequests();
    } catch (error: any) {
      console.error("Error updating request:", error);
      toastMessages.latePass.updateError();
    } finally {
      setUpdating(false);
    }
  };

  const openDetailModal = (request: LatePassRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setApprovalNotes(request.approvalNotes || "");
    setShowDetailModal(true);
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

  const downloadPDF = (request: LatePassRequest) => {
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Late Pass Request", 105, 20, { align: "center" });

      // Horizontal line
      doc.setLineWidth(0.5);
      doc.line(20, 25, 190, 25);

      // Request ID and Status
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Request ID: ${request.requestId}`, 20, 35);

      doc.setFont("helvetica", "bold");
      const statusColor = request.status === "approved" ? [34, 197, 94] :
                         request.status === "rejected" ? [239, 68, 68] : [234, 179, 8];
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(`Status: ${request.status.toUpperCase()}`, 150, 35);
      doc.setTextColor(0, 0, 0);

      // Student Information Section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Student Information", 20, 50);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      let yPos = 60;
      doc.text(`Name: ${request.studentName}`, 20, yPos);
      yPos += 7;
      doc.text(`Student ID: ${request.studentId}`, 20, yPos);
      yPos += 7;
      doc.text(`Branch: ${request.branch}`, 20, yPos);
      yPos += 7;
      doc.text(`Room Number: ${request.roomNumber}`, 20, yPos);

      // Request Details Section
      yPos += 15;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Request Details", 20, yPos);

      yPos += 10;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Date: ${formatDate(request.requestedDate)}`, 20, yPos);
      yPos += 7;
      doc.text(`Departure Time: ${formatTime(request.startTime)}`, 20, yPos);
      yPos += 7;
      doc.text(`Expected Return Time: ${formatTime(request.endTime)}`, 20, yPos);
      yPos += 7;
      doc.text(`Reason: ${request.reason.charAt(0).toUpperCase() + request.reason.slice(1)}`, 20, yPos);
      yPos += 7;
      doc.text(`Submitted On: ${formatDate(request.createdAt)}`, 20, yPos);

      // Description
      yPos += 12;
      doc.setFont("helvetica", "bold");
      doc.text("Description:", 20, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");
      const descriptionLines = doc.splitTextToSize(request.description, 170);
      doc.text(descriptionLines, 20, yPos);
      yPos += descriptionLines.length * 7;

      // Admin Notes (if any)
      if (request.approvalNotes) {
        yPos += 10;
        doc.setFont("helvetica", "bold");
        doc.text("Admin Notes:", 20, yPos);
        yPos += 7;
        doc.setFont("helvetica", "normal");
        const notesLines = doc.splitTextToSize(request.approvalNotes, 170);
        doc.text(notesLines, 20, yPos);
        yPos += notesLines.length * 7;
      }

      // Approval Date (if approved)
      if (request.approvedAt) {
        yPos += 5;
        doc.text(`Approved On: ${formatDate(request.approvedAt)}`, 20, yPos);
      }

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text("This is a system-generated document.", 105, 280, { align: "center" });
      doc.text(`Generated on: ${new Date().toLocaleDateString("en-US")} ${new Date().toLocaleTimeString("en-US")}`, 105, 285, { align: "center" });

      // Save the PDF
      doc.save(`Late_Pass_${request.studentId}_${request.requestId}.pdf`);
      toastMessages.latePass.downloadSuccess();
    } catch (error) {
      console.error("Error generating PDF:", error);
      toastMessages.latePass.downloadError();
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const uniqueBranches = Array.from(
    new Set(requests.map((r) => r.branch))
  ).filter(Boolean);

  return (
    <DashboardLayout type="admin">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Late Pass Management
            </h1>
            <p className="text-neutral-600">
              Review and approve student late pass requests
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl shadow-2xl p-6 text-white"
            >
              <p className="text-blue-100 text-sm mb-1">Total Requests</p>
              <p className="text-4xl font-bold">{stats.total}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl shadow-2xl p-6 text-white"
            >
              <p className="text-yellow-100 text-sm mb-1">Pending</p>
              <p className="text-4xl font-bold">{stats.pending}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl shadow-2xl p-6 text-white"
            >
              <p className="text-green-100 text-sm mb-1">Approved</p>
              <p className="text-4xl font-bold">{stats.approved}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl shadow-2xl p-6 text-white"
            >
              <p className="text-red-100 text-sm mb-1">Rejected</p>
              <p className="text-4xl font-bold">{stats.rejected}</p>
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Filter by Branch
                </label>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                >
                  <option value="all">All Branches</option>
                  {uniqueBranches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Requests Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-neutral-200/50"
          >
            <h2 className="text-2xl font-bold text-neutral-800 mb-6">
              Late Pass Requests
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-500">No late pass requests found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map((request, index) => (
                  <motion.div
                    key={request.requestId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openDetailModal(request)}
                    className="bg-white/80 rounded-2xl p-6 border border-neutral-200 hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-neutral-800">
                          {request.studentName}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {request.studentId}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusTextColor(
                          request.status
                        )} bg-white border-2 border-current`}
                      >
                        {request.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">Branch:</span>
                        <span className="font-semibold text-neutral-800">
                          {request.branch}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">Room:</span>
                        <span className="font-semibold text-neutral-800">
                          {request.roomNumber}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">Date:</span>
                        <span className="font-semibold text-neutral-800">
                          {formatDate(request.requestedDate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">Time:</span>
                        <span className="font-semibold text-neutral-800">
                          {formatTime(request.startTime)} -{" "}
                          {formatTime(request.endTime)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-neutral-500 mb-1 capitalize">
                        Reason: {request.reason}
                      </p>
                      <p className="text-sm text-neutral-700 line-clamp-2">
                        {request.description}
                      </p>
                    </div>

                    <button className="w-full px-4 py-2 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg font-semibold transition-all duration-200 text-sm">
                      View Details
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800">
                    Late Pass Request Details
                  </h2>
                  <p className="text-neutral-600">
                    Request ID: {selectedRequest.requestId}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Student Info */}
                <div className="bg-neutral-50 rounded-2xl p-6">
                  <h3 className="font-bold text-neutral-800 mb-4">
                    Student Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-500">Name</p>
                      <p className="font-semibold text-neutral-800">
                        {selectedRequest.studentName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Student ID</p>
                      <p className="font-semibold text-neutral-800">
                        {selectedRequest.studentId}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Branch</p>
                      <p className="font-semibold text-neutral-800">
                        {selectedRequest.branch}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Room Number</p>
                      <p className="font-semibold text-neutral-800">
                        {selectedRequest.roomNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Request Details */}
                <div className="bg-blue-50 rounded-2xl p-6">
                  <h3 className="font-bold text-neutral-800 mb-4">
                    Request Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-neutral-500">Date</p>
                      <p className="font-semibold text-neutral-800">
                        {formatDate(selectedRequest.requestedDate)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-neutral-500">
                          Departure Time
                        </p>
                        <p className="font-semibold text-neutral-800">
                          {formatTime(selectedRequest.startTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">Return Time</p>
                        <p className="font-semibold text-neutral-800">
                          {formatTime(selectedRequest.endTime)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Reason</p>
                      <p className="font-semibold text-neutral-800 capitalize">
                        {selectedRequest.reason}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 mb-2">
                        Description
                      </p>
                      <p className="text-neutral-700">
                        {selectedRequest.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Submitted On</p>
                      <p className="font-semibold text-neutral-800">
                        {formatDate(selectedRequest.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="bg-purple-50 rounded-2xl p-6">
                  <h3 className="font-bold text-neutral-800 mb-4">
                    Update Status
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Admin Notes
                      </label>
                      <textarea
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        rows={4}
                        placeholder="Add notes for the student..."
                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={handleUpdateStatus}
                        disabled={updating}
                        className="px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-lg disabled:opacity-50 font-semibold transition-all duration-200"
                      >
                        {updating ? "Updating..." : "Update Request"}
                      </button>
                      <button
                        onClick={() => downloadPDF(selectedRequest)}
                        className="px-6 py-3 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl hover:shadow-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
