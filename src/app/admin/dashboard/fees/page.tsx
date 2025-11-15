"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";
import { toastMessages } from "@/lib/toast-messages";

interface FeeConfiguration {
  year: string;
  hostelFee: number;
  maintenanceFee: number;
  securityDeposit: number;
  otherFees: number;
  totalFee: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminFeesPage() {
  const [feeConfigs, setFeeConfigs] = useState<FeeConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingYear, setEditingYear] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear().toString(),
    hostelFee: "",
    maintenanceFee: "",
    securityDeposit: "",
    otherFees: "",
  });

  useEffect(() => {
    fetchFeeConfigurations();
  }, []);

  const fetchFeeConfigurations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/fees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFeeConfigs(data.feeConfigurations || []);
      }
    } catch (error) {
      console.error("Failed to fetch fee configurations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/fees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        if (editingYear) {
          toastMessages.fees.updateSuccess(editingYear);
        } else {
          toastMessages.general.saveSuccess();
        }
        setShowForm(false);
        setEditingYear(null);
        setFormData({
          year: new Date().getFullYear().toString(),
          hostelFee: "",
          maintenanceFee: "",
          securityDeposit: "",
          otherFees: "",
        });
        fetchFeeConfigurations();
      } else {
        toastMessages.fees.updateError();
      }
    } catch (error) {
      console.error("Submit error:", error);
      toastMessages.fees.updateError();
    }
  };

  const handleEdit = (config: FeeConfiguration) => {
    setFormData({
      year: config.year,
      hostelFee: config.hostelFee.toString(),
      maintenanceFee: config.maintenanceFee.toString(),
      securityDeposit: config.securityDeposit.toString(),
      otherFees: config.otherFees.toString(),
    });
    setEditingYear(config.year);
    setShowForm(true);
  };

  const handleDelete = async (year: string) => {
    if (!confirm(`Are you sure you want to delete fee configuration for year ${year}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/fees?year=${year}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toastMessages.general.saveSuccess();
        fetchFeeConfigurations();
      } else {
        toastMessages.fees.updateError();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toastMessages.fees.updateError();
    }
  };

  const calculateTotal = () => {
    const total =
      parseFloat(formData.hostelFee || "0") +
      parseFloat(formData.maintenanceFee || "0") +
      parseFloat(formData.securityDeposit || "0") +
      parseFloat(formData.otherFees || "0");
    return total;
  };

  if (loading) {
    return (
      <DashboardLayout type="admin" title="Loading..." subtitle="">
        <div className="flex justify-center items-center h-64">
          <p className="text-neutral-600">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      type="admin"
      title="Fees Management"
      subtitle="Configure yearly hostel fees"
    >
      <div className="space-y-8">
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <p className="text-neutral-600">
            Manage fee structures for different academic years
          </p>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingYear(null);
              setFormData({
                year: new Date().getFullYear().toString(),
                hostelFee: "",
                maintenanceFee: "",
                securityDeposit: "",
                otherFees: "",
              });
            }}
            className="px-6 py-3 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl hover:from-blue-600 hover:to-cyan-600 font-medium transition-all shadow-lg"
          >
            {showForm ? "Cancel" : "+ Add Fee Configuration"}
          </button>
        </motion.div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-neutral-200/50"
            >
              <h2 className="text-2xl font-light tracking-tight text-neutral-900 mb-6">
                {editingYear ? `Edit Fee Configuration - ${editingYear}` : "Add New Fee Configuration"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/20 transition-all bg-white"
                      placeholder="e.g., 2024-2025"
                      required
                      disabled={!!editingYear}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Hostel Fee (RS)
                    </label>
                    <input
                      type="number"
                      value={formData.hostelFee}
                      onChange={(e) =>
                        setFormData({ ...formData, hostelFee: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/20 transition-all bg-white"
                      placeholder="5000"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Maintenance Fee (RS)
                    </label>
                    <input
                      type="number"
                      value={formData.maintenanceFee}
                      onChange={(e) =>
                        setFormData({ ...formData, maintenanceFee: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/20 transition-all bg-white"
                      placeholder="1000"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Security Deposit (RS)
                    </label>
                    <input
                      type="number"
                      value={formData.securityDeposit}
                      onChange={(e) =>
                        setFormData({ ...formData, securityDeposit: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/20 transition-all bg-white"
                      placeholder="2000"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Other Fees (RS)
                    </label>
                    <input
                      type="number"
                      value={formData.otherFees}
                      onChange={(e) =>
                        setFormData({ ...formData, otherFees: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/20 transition-all bg-white"
                      placeholder="500"
                      min="0"
                    />
                  </div>

                  <div className="flex items-end">
                    <div className="w-full p-4 bg-green-50 rounded-2xl border border-green-200">
                      <p className="text-sm text-neutral-600 mb-1">Total Fee</p>
                      <p className="text-3xl font-light text-green-600">
                        RS {calculateTotal().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 font-medium transition-all shadow-lg"
                >
                  {editingYear ? "Update Configuration" : "Create Configuration"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fee Configurations List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-neutral-200/50"
        >
          <h2 className="text-2xl font-light tracking-tight text-neutral-900 mb-6">
            Fee Configurations
          </h2>

          {feeConfigs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-neutral-500">No fee configurations yet</p>
              <p className="text-sm text-neutral-400 mt-2">
                Add your first fee configuration to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feeConfigs.map((config, index) => (
                <motion.div
                  key={config.year}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-neutral-200 rounded-2xl p-6 hover:shadow-lg transition-all bg-white/50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-medium text-neutral-900">
                        Academic Year: {config.year}
                      </h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        Last updated: {new Date(config.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(config)}
                        className="px-4 py-2 bg-blue-500/10 text-blue-600 rounded-xl hover:bg-blue-500/20 font-medium transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(config.year)}
                        className="px-4 py-2 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500/20 font-medium transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-neutral-50 p-4 rounded-xl">
                      <p className="text-xs text-neutral-600 mb-1">Hostel Fee</p>
                      <p className="text-lg font-medium text-neutral-900">
                        RS {config.hostelFee.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-xl">
                      <p className="text-xs text-neutral-600 mb-1">Maintenance</p>
                      <p className="text-lg font-medium text-neutral-900">
                        RS {config.maintenanceFee.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-xl">
                      <p className="text-xs text-neutral-600 mb-1">Security</p>
                      <p className="text-lg font-medium text-neutral-900">
                        RS {config.securityDeposit.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-xl">
                      <p className="text-xs text-neutral-600 mb-1">Other Fees</p>
                      <p className="text-lg font-medium text-neutral-900">
                        RS {config.otherFees.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                      <p className="text-xs text-green-600 mb-1 font-medium">Total Fee</p>
                      <p className="text-lg font-bold text-green-600">
                        RS {config.totalFee.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
