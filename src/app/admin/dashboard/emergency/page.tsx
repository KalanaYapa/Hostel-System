"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";
import { toastMessages } from "@/lib/toast-messages";

interface EmergencyContact {
  contactId: string;
  name: string;
  category: "medical" | "security" | "transport" | "other";
  phone: string;
  email?: string;
  available247: boolean;
  description: string;
}

export default function EmergencyContactsPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    category: "medical" as "medical" | "security" | "transport" | "other",
    phone: "",
    email: "",
    available247: true,
    description: "",
  });

  const categories = ["medical", "security", "transport", "other"];

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      // Cookies are sent automatically
      const response = await fetch("/api/admin/emergency");

      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      } else {
        console.error("Failed to fetch contacts");
        setContacts([]);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Cookies are sent automatically
      const body = editingContact
        ? { contactId: editingContact.contactId, category: editingContact.category, updates: formData }
        : formData;

      const response = await fetch("/api/admin/emergency", {
        method: editingContact ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        if (editingContact) {
          toastMessages.emergency.updateSuccess();
        } else {
          toastMessages.emergency.createSuccess();
        }
        setShowAddModal(false);
        setEditingContact(null);
        setFormData({
          name: "",
          category: "medical",
          phone: "",
          email: "",
          available247: true,
          description: "",
        });
        fetchContacts();
      } else {
        const errorData = await response.json();
        toastMessages.emergency.createError();
      }
    } catch (error) {
      console.error("Error:", error);
      toastMessages.emergency.createError();
    }
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      category: contact.category,
      phone: contact.phone,
      email: contact.email || "",
      available247: contact.available247,
      description: contact.description || "",
    });
    setShowAddModal(true);
  };

  const handleDelete = async (contactId: string, category: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      // Cookies are sent automatically
      const response = await fetch(`/api/admin/emergency?contactId=${contactId}&category=${category}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toastMessages.emergency.deleteSuccess();
        fetchContacts();
      } else {
        const errorData = await response.json();
        toastMessages.emergency.deleteError();
      }
    } catch (error) {
      console.error("Error:", error);
      toastMessages.emergency.deleteError();
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "medical":
        return "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
      case "security":
        return "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z";
      case "transport":
        return "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2";
      case "other":
        return "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z";
      default:
        return "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "medical":
        return "from-red-500 to-pink-500";
      case "security":
        return "from-blue-500 to-indigo-500";
      case "transport":
        return "from-green-500 to-emerald-500";
      case "other":
        return "from-purple-500 to-pink-500";
      default:
        return "from-neutral-500 to-neutral-600";
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesCategory = filterCategory === "all" || contact.category === filterCategory;
    return matchesCategory;
  });

  // Group contacts by category
  const groupedContacts = categories.reduce((acc, category) => {
    acc[category] = filteredContacts.filter((c) => c.category === category);
    return acc;
  }, {} as Record<string, EmergencyContact[]>);

  const stats = {
    total: contacts.length,
    medical: contacts.filter((c) => c.category === "medical").length,
    security: contacts.filter((c) => c.category === "security").length,
    emergency24x7: contacts.filter((c) => c.available247).length,
  };

  return (
    <DashboardLayout type="admin" title="Emergency Contacts" subtitle="Manage emergency contact information">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Contacts", value: stats.total, color: "from-blue-500 to-cyan-500" },
          { label: "Medical", value: stats.medical, color: "from-red-500 to-pink-500" },
          { label: "Security", value: stats.security, color: "from-blue-500 to-indigo-500" },
          { label: "24/7 Available", value: stats.emergency24x7, color: "from-green-500 to-emerald-500" },
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
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setEditingContact(null);
              setFormData({
                name: "",
                category: "medical",
                phone: "",
                email: "",
                available247: true,
                description: "",
              });
              setShowAddModal(true);
            }}
            className="ml-auto px-6 py-2.5 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-lg transition-all font-medium"
          >
            + Add Contact
          </button>
        </div>
      </motion.div>

      {/* Contacts by Category */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-neutral-600">Loading contacts...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 text-center border border-neutral-200/50">
          <p className="text-gray-600 mb-2">No emergency contacts added yet.</p>
          <p className="text-sm text-gray-500">Click the "Add Contact" button above to add your first emergency contact.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {(filterCategory === "all" ? categories : [filterCategory]).map((category) => {
            const categoryContacts = groupedContacts[category] || [];
            if (categoryContacts.length === 0) return null;

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-light text-neutral-900 mb-4 flex items-center gap-3">
                  <div className={`h-10 w-10 bg-gradient-to-br ${getCategoryColor(category)} rounded-2xl flex items-center justify-center`}>
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={getCategoryIcon(category)} />
                    </svg>
                  </div>
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryContacts.map((contact, index) => (
                    <motion.div
                      key={contact.contactId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50 hover:shadow-3xl transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-light text-neutral-900">{contact.name}</h3>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                            contact.available247
                              ? "bg-green-500/10 text-green-600"
                              : "bg-blue-500/10 text-blue-600"
                          }`}>
                            {contact.available247 ? "24/7 Available" : "Working Hours"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3 text-sm">
                          <svg className="h-4 w-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="font-medium text-neutral-900">{contact.phone}</span>
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-3 text-sm">
                            <svg className="h-4 w-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-neutral-700">{contact.email}</span>
                          </div>
                        )}
                        {contact.description && (
                          <p className="text-sm text-neutral-600 pt-2">{contact.description}</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCall(contact.phone)}
                          className="flex-1 px-4 py-2 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl hover:shadow-lg transition-all text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Call
                        </button>
                        <button
                          onClick={() => handleEdit(contact)}
                          className="px-4 py-2 bg-black/5 hover:bg-black/10 text-neutral-900 rounded-2xl transition-all text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(contact.contactId, contact.category)}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-2xl transition-all text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
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
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-light text-neutral-900 mb-6">
                {editingContact ? "Edit Contact" : "Add New Contact"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>

                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.available247}
                      onChange={(e) => setFormData({ ...formData, available247: e.target.checked })}
                      className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-neutral-700">Available 24/7</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/20 resize-none"
                    rows={3}
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
                    {editingContact ? "Update" : "Add"} Contact
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
