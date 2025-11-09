"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StudentSidebar from "./StudentSidebar";
import AdminSidebar from "./AdminSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  type: "student" | "admin";
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, type, title, subtitle }: DashboardLayoutProps) {
  const router = useRouter();
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");

    if (!token || userType !== type) {
      router.push(`/${type}/login`);
      return;
    }

    if (type === "student") {
      const storedData = localStorage.getItem("studentData");
      if (storedData) {
        const data = JSON.parse(storedData);
        setStudentName(data.name || "");
      }
    }
  }, [router, type]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    if (type === "student") {
      localStorage.removeItem("studentData");
    }
    router.push(`/${type}/login`);
  };

  return (
    <div className="min-h-screen bg-neutral-50 transition-colors duration-500">
      {type === "student" ? (
        <StudentSidebar studentName={studentName} onLogout={handleLogout} />
      ) : (
        <AdminSidebar onLogout={handleLogout} />
      )}

      {/* Main Content with Sidebar Offset */}
      <div className="lg:pl-[280px] transition-all duration-300">
        {title && (
          <header className="bg-white/70 backdrop-blur-xl border-b border-neutral-200/50 transition-all duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div>
                <h1 className="text-3xl font-light tracking-tight text-neutral-900">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-base font-light text-neutral-600 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </header>
        )}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
