import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Registration | SUSL Hostel Management System",
  description: "Register for Sabaragamuwa University hostel accommodation. Create your student account to access hostel facilities and services online.",
  keywords: [
    "SUSL student registration",
    "hostel signup",
    "Sabaragamuwa University registration",
    "student accommodation booking",
    "hostel admission"
  ],
  openGraph: {
    title: "Student Registration | SUSL Hostel Portal",
    description: "Sign up for hostel accommodation at Sabaragamuwa University.",
    type: "website",
  },
  alternates: {
    canonical: "https://yourdomain.com/student/signup",
  },
};

export default function StudentSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
