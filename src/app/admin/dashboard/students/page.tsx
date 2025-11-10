"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { motion } from "framer-motion";

interface Student {
  studentId: string;
  name: string;
  email: string;
  phone: string;
  branch?: string;
  roomNumber?: string;
  feesPaid: boolean;
  active: boolean;
  registrationDate: string;
}

interface Branch {
  branchId: string;
  name: string;
  description?: string;
  capacity: number;
  occupied: number;
}

interface Room {
  branch: string;
  roomNumber: string;
  capacity: number;
  occupied: number;
  students: string[];
}

export default function StudentsManagementPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    branch: "",
    roomNumber: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchBranches();
    fetchRooms();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/students", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/branches", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBranches(data.branches || []);
      }
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      branch: student.branch || "",
      roomNumber: student.roomNumber || "",
    });
  };

  const handleUpdate = async () => {
    if (!editingStudent) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/students", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: editingStudent.studentId,
          updates: formData,
        }),
      });

      if (response.ok) {
        alert("Student updated successfully!");
        setEditingStudent(null);
        fetchStudents();
      } else {
        alert("Failed to update student");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update student");
    }
  };

  const handleDeactivate = async (studentId: string) => {
    if (!confirm("Are you sure you want to deactivate this student?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/admin/students?studentId=${studentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("Student deactivated successfully!");
        fetchStudents();
      } else {
        alert("Failed to deactivate student");
      }
    } catch (error) {
      console.error("Deactivate error:", error);
      alert("Failed to deactivate student");
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout type="admin" title="Student Management" subtitle="Manage student information and room assignments">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search students by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
          />
        </div>

        {/* Students Table */}
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-neutral-200/50">
          {loading ? (
            <p className="p-6 text-gray-600">Loading students...</p>
          ) : filteredStudents.length === 0 ? (
            <p className="p-6 text-gray-600">No students found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.studentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div>{student.email}</div>
                        <div>{student.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.branch ? (
                          branches.find(b => b.branchId === student.branch)?.name || student.branch
                        ) : (
                          <span className="text-orange-600">Not Assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.roomNumber || (
                          <span className="text-orange-600">Not Assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            student.feesPaid
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {student.feesPaid ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            student.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {student.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        {student.active && (
                          <button
                            onClick={() => handleDeactivate(student.studentId)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-neutral-200/50"
          >
            <h2 className="text-2xl font-light tracking-tight mb-4">Edit Student</h2>
            <p className="text-gray-600 mb-4">
              {editingStudent.name} ({editingStudent.studentId})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch
                </label>
                <select
                  value={formData.branch}
                  onChange={(e) =>
                    setFormData({ ...formData, branch: e.target.value, roomNumber: "" })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.branchId} value={branch.branchId}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Number
                </label>
                <select
                  value={formData.roomNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, roomNumber: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                  disabled={!formData.branch}
                >
                  <option value="">
                    {!formData.branch
                      ? "Select branch first"
                      : "Select Room"}
                  </option>
                  {rooms
                    .filter((room) => room.branch === formData.branch)
                    .filter((room) => room.occupied < room.capacity)
                    .map((room) => (
                      <option key={room.roomNumber} value={room.roomNumber}>
                        Room {room.roomNumber} ({room.occupied}/{room.capacity} occupied)
                      </option>
                    ))}
                </select>
                {formData.branch && rooms.filter((room) => room.branch === formData.branch && room.occupied < room.capacity).length === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    No available rooms in this branch
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleUpdate}
                className="flex-1 py-3 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-lg font-semibold transition-all duration-200"
              >
                Update
              </button>
              <button
                onClick={() => setEditingStudent(null)}
                className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-2xl hover:bg-gray-400 font-semibold transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
