"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Room {
  roomId: string;
  roomNumber: string;
  branch: string;
  capacity: number;
  occupied: number;
  status: "available" | "full" | "maintenance";
  floor: number;
  type: "single" | "double" | "triple" | "quad";
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [formData, setFormData] = useState({
    roomNumber: "",
    branch: "",
    capacity: 2,
    floor: 1,
    type: "double" as "single" | "double" | "triple" | "quad",
  });

  const branches = ["CS", "ECE", "ME", "CE", "EE"];
  const roomTypes = [
    { value: "single", label: "Single", capacity: 1 },
    { value: "double", label: "Double", capacity: 2 },
    { value: "triple", label: "Triple", capacity: 3 },
    { value: "quad", label: "Quad", capacity: 4 },
  ];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const url = editingRoom
        ? `/api/admin/rooms/${editingRoom.roomId}`
        : "/api/admin/rooms";

      const response = await fetch(url, {
        method: editingRoom ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(editingRoom ? "Room updated successfully!" : "Room added successfully!");
        setShowAddModal(false);
        setEditingRoom(null);
        setFormData({ roomNumber: "", branch: "", capacity: 2, floor: 1, type: "double" });
        fetchRooms();
      } else {
        alert("Failed to save room");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save room");
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      branch: room.branch,
      capacity: room.capacity,
      floor: room.floor,
      type: room.type,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("Room deleted successfully!");
        fetchRooms();
      } else {
        alert("Failed to delete room");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to delete room");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "full":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "maintenance":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      default:
        return "bg-neutral-500/10 text-neutral-600 border-neutral-500/20";
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesBranch = filterBranch === "all" || room.branch === filterBranch;
    const matchesStatus = filterStatus === "all" || room.status === filterStatus;
    return matchesBranch && matchesStatus;
  });

  const stats = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === "available").length,
    full: rooms.filter((r) => r.status === "full").length,
    maintenance: rooms.filter((r) => r.status === "maintenance").length,
  };

  return (
    <DashboardLayout type="admin" title="Rooms & Branches" subtitle="Manage hostel rooms and assignments">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Rooms", value: stats.total, color: "from-blue-500 to-cyan-500" },
          { label: "Available", value: stats.available, color: "from-green-500 to-emerald-500" },
          { label: "Full", value: stats.full, color: "from-red-500 to-pink-500" },
          { label: "Maintenance", value: stats.maintenance, color: "from-yellow-500 to-orange-500" },
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

      {/* Filters and Add Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50 mb-8"
      >
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
          >
            <option value="all">All Branches</option>
            {branches.map((branch) => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="full">Full</option>
            <option value="maintenance">Maintenance</option>
          </select>

          <button
            onClick={() => {
              setEditingRoom(null);
              setFormData({ roomNumber: "", branch: "", capacity: 2, floor: 1, type: "double" });
              setShowAddModal(true);
            }}
            className="ml-auto px-6 py-2.5 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-lg transition-all font-medium"
          >
            + Add Room
          </button>
        </div>
      </motion.div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-neutral-600">Loading rooms...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room, index) => (
            <motion.div
              key={room.roomId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50 hover:shadow-3xl transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-light text-neutral-900">Room {room.roomNumber}</h3>
                  <p className="text-sm text-neutral-600">Floor {room.floor} • {room.branch}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(room.status)}`}>
                  {room.status}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Type:</span>
                  <span className="font-medium text-neutral-900 capitalize">{room.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Capacity:</span>
                  <span className="font-medium text-neutral-900">{room.capacity} students</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Occupied:</span>
                  <span className="font-medium text-neutral-900">{room.occupied} / {room.capacity}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(room)}
                  className="flex-1 px-4 py-2 bg-black/5 hover:bg-black/10 text-neutral-900 rounded-2xl transition-all text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(room.roomId)}
                  className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-2xl transition-all text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-2xl font-light text-neutral-900 mb-6">
                {editingRoom ? "Edit Room" : "Add New Room"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Room Number</label>
                  <input
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Branch</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20"
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Room Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      const type = e.target.value as "single" | "double" | "triple" | "quad";
                      const capacity = roomTypes.find(t => t.value === type)?.capacity || 2;
                      setFormData({ ...formData, type, capacity });
                    }}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20"
                    required
                  >
                    {roomTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} ({type.capacity} capacity)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Floor</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20"
                    min="1"
                    max="10"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-2xl transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-lg transition-all font-medium"
                  >
                    {editingRoom ? "Update" : "Add"} Room
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
