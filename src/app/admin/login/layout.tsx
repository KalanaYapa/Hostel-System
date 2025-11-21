import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | SUSL Hostel Management System",
  description: "Administrative access for Sabaragamuwa University hostel management. Manage students, rooms, maintenance, fees, and hostel operations.",
  openGraph: {
    title: "Admin Portal | SUSL Hostel Management",
    description: "Secure admin login for hostel management operations.",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://yourdomain.com/admin/login",
  },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
