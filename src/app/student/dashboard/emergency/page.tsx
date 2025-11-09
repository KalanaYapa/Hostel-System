"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { motion } from "framer-motion";

interface EmergencyContact {
  contactId: string;
  category: "medical" | "transport" | "security" | "other";
  name: string;
  phone: string;
  email?: string;
  description: string;
  available247: boolean;
}

export default function EmergencyPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [grouped, setGrouped] = useState<Record<string, EmergencyContact[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/student/emergency", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
        setGrouped(data.grouped || {});
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "medical":
        return (
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        );
      case "transport":
        return (
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        );
      case "security":
        return (
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "medical":
        return "bg-red-100 text-red-600";
      case "transport":
        return "bg-blue-100 text-blue-600";
      case "security":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const categories = ["medical", "transport", "security", "other"];

  return (
    <DashboardLayout type="student" title="Emergency Contacts" subtitle="Important contacts for emergencies">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Emergency Banner */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-3xl p-6 mb-8 flex items-center shadow-2xl">
          <svg
            className="h-12 w-12 mr-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h2 className="text-xl font-bold mb-1">In Case of Emergency</h2>
            <p className="text-red-100">
              Call these numbers immediately for urgent assistance
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading contacts...</p>
        ) : contacts.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 text-center border border-neutral-200/50">
            <p className="text-gray-600">
              No emergency contacts available yet.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Admin needs to add emergency contacts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) =>
              grouped[category] && grouped[category].length > 0 ? (
                <div key={category} className="space-y-4">
                  <h2 className="text-2xl font-light tracking-tight capitalize flex items-center">
                    <span
                      className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${getCategoryColor(
                        category
                      )}`}
                    >
                      {getCategoryIcon(category)}
                    </span>
                    {category}
                  </h2>

                  <div className="space-y-3">
                    {grouped[category].map((contact) => (
                      <motion.div
                        key={contact.contactId}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-neutral-200/50 hover:shadow-xl transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">
                            {contact.name}
                          </h3>
                          {contact.available247 && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              24/7
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {contact.description}
                        </p>

                        <div className="space-y-2">
                          <a
                            href={`tel:${contact.phone}`}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <svg
                              className="h-5 w-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <span className="font-semibold">
                              {contact.phone}
                            </span>
                          </a>

                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              className="flex items-center text-blue-600 hover:text-blue-800"
                            >
                              <svg
                                className="h-5 w-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span>{contact.email}</span>
                            </a>
                          )}
                        </div>

                        <button
                          onClick={() => window.open(`tel:${contact.phone}`)}
                          className="w-full mt-4 py-2 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl hover:shadow-lg font-semibold transition-all duration-200"
                        >
                          Call Now
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
