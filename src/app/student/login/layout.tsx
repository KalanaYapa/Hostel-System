import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Login | SUSL Hostel Management System",
  description: "Access your Sabaragamuwa University hostel account. Login to manage room bookings, view fees, submit maintenance requests, and track attendance.",
  keywords: [
    "SUSL student login",
    "hostel student portal",
    "Sabaragamuwa University login",
    "student accommodation login",
    "hostel management login"
  ],
  openGraph: {
    title: "Student Login | SUSL Hostel Portal",
    description: "Secure student login for Sabaragamuwa University hostel management.",
    type: "website",
  },
  alternates: {
    canonical: "https://yourdomain.com/student/login",
  },
};

export default function StudentLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
