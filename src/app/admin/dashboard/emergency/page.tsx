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
      const body = editingContact
        ? { contactId: editingContact.contactId, category: editingContact.category, updates: formData }
        : formData;

      const response = await fetch("/api/admin/emergency", {
        method: editingContact ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        editingContact ? toastMessages.emergency.updateSuccess() : toastMessages.emergency.createSuccess();

        setShowAddModal(false);
        setEditingContact(null);
        setFormData({ name: "", category: "medical", phone: "", email: "", available247: true, description: "" });
        fetchContacts();
      } else {
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
      const response = await fetch(`/api/admin/emergency?contactId=${contactId}&category=${category}`, { method: "DELETE" });

      if (response.ok) {
        toastMessages.emergency.deleteSuccess();
        fetchContacts();
      } else {
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
      default:
        return "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "medical":
        return "from-rose-500 to-pink-600";
      case "security":
        return "from-blue-600 to-indigo-700";
      case "transport":
        return "from-teal-500 to-emerald-600";
      case "other":
        return "from-violet-500 to-fuchsia-600";
      default:
        return "from-neutral-500 to-neutral-700";
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    return filterCategory === "all" || contact.category === filterCategory;
  });

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Contacts", value: stats.total, color: "from-indigo-500 to-purple-600" },
          { label: "Medical", value: stats.medical, color: "from-rose-500 to-pink-600" },
          { label: "Security", value: stats.security, color: "from-blue-600 to-indigo-700" },
          { label: "24/7 Available", value: stats.emergency24x7, color: "from-teal-500 to-green-600" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${stat.color} text-white rounded-3xl shadow-xl p-6 border border-white/20 backdrop-blur-2xl`}
          >
            <p className="text-sm font-light mb-2">{stat.label}</p>
            <p className="text-4xl font-light">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-neutral-200 mb-8"
      >
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-neutral-300 focus:ring-2 focus:ring-purple-400 bg-white shadow-sm"
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
              setFormData({ name: "", category: "medical", phone: "", email: "", available247: true, description: "" });
              setShowAddModal(true);
            }}
            className="ml-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:shadow-lg transition-all"
          >
            + Add Contact
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="text-center py-12 text-neutral-600">Loading contacts...</div>
      ) : contacts.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-8 text-center border border-neutral-200">
          <p className="text-gray-600 mb-2">No emergency contacts added yet.</p>
          <p className="text-sm text-gray-500">Click the "Add Contact" button above to add your first emergency contact.</p>
        </div>
      ) : (
        <div className="space-y-8">
```jsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, Plus, X } from "lucide-react";

export default function EmergencyContactsPage() {
  const [contacts, setContacts] = useState([
    { id: 1, name: "Police", number: "119" },
    { id: 2, name: "Ambulance", number: "1990" },
  ]);

  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [adding, setAdding] = useState(false);

  const addContact = () => {
    if (newName.trim() === "" || newNumber.trim() === "") return;
    const newContact = {
      id: Date.now(),
      name: newName,
      number: newNumber,
    };
    setContacts([...contacts, newContact]);
    setNewName("");
    setNewNumber("");
    setAdding(false);
  };

  const deleteContact = (id) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-6">
      <div className="max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 drop-shadow-lg"
        >
          Emergency Contacts
        </motion.h1>

        {/* Add Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition-all shadow-lg shadow-blue-800/40"
          >
            <Plus size={20} /> Add Contact
          </button>
        </div>

        {/* Add Contact Form */}
        {adding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-white/10 mb-6"
          >
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/20 focus:bg-white/30 outline-none placeholder-gray-300"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/20 focus:bg-white/30 outline-none placeholder-gray-300"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setAdding(false)}
                  className="px-4 py-2 rounded-xl bg-red-500/70 hover:bg-red-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={addContact}
                  className="px-4 py-2 rounded-xl bg-green-500/70 hover:bg-green-600 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Contact List */}
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-xl hover:shadow-blue-900/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md group-hover:scale-110 transition-transform">
                  <Phone size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{contact.name}</h2>
                  <p className="text-gray-300">{contact.number}</p>
                </div>
              </div>

              <button
                onClick={() => deleteContact(contact.id)}
                className="p-2 rounded-lg bg-red-500/70 hover:bg-red-600 transition shadow-md"
              >
                <X size={18} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

