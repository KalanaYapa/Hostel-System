import { Metadata } from "next";

// Base URL - Update this with your actual domain
export const BASE_URL = "https://yourdomain.com";

// Structured data helper
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Sabaragamuwa University of Sri Lanka",
    "alternateName": "SUSL",
    "url": "https://www.sab.ac.lk",
    "logo": `${BASE_URL}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+94-45-2280047",
      "contactType": "Admissions",
      "areaServed": "LK",
      "availableLanguage": ["en", "si", "ta"]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "P.O. Box 02",
      "addressLocality": "Belihuloya",
      "addressRegion": "Sabaragamuwa Province",
      "addressCountry": "LK"
    },
    "sameAs": [
      "https://www.facebook.com/sabaragamuwauniversity",
      "https://www.sab.ac.lk"
    ]
  };
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Sabaragamuwa University Hostel Management System",
    "alternateName": "SUSL HMS",
    "url": BASE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${BASE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function generateSoftwareAppSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SUSL Hostel Management System",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "LKR"
    },
    "description": "Comprehensive hostel management solution for Sabaragamuwa University students to manage accommodation, fees, maintenance, and more.",
    "featureList": [
      "Room Allocation Management",
      "Online Fee Payment",
      "Maintenance Request Tracking",
      "Late Pass Applications",
      "Attendance Tracking",
      "Emergency Alerts"
    ],
    "screenshot": `${BASE_URL}/screenshot.png`,
    "provider": {
      "@type": "Organization",
      "name": "SPACE SOLUTIONS INTERNATIONAL (PVT) LTD"
    }
  };
}

// Page-specific metadata generators
export function generateStudentLoginMetadata(): Metadata {
  return {
    title: "Student Login | SUSL Hostel Management System",
    description: "Access your Sabaragamuwa University hostel account. Login to manage room bookings, view fees, submit maintenance requests, and track attendance.",
    openGraph: {
      title: "Student Login | SUSL Hostel Portal",
      description: "Secure student login for Sabaragamuwa University hostel management.",
      url: `${BASE_URL}/student/login`,
    },
    alternates: {
      canonical: `${BASE_URL}/student/login`,
    },
  };
}

export function generateStudentSignupMetadata(): Metadata {
  return {
    title: "Student Registration | SUSL Hostel Management System",
    description: "Register for Sabaragamuwa University hostel accommodation. Create your student account to access hostel facilities and services.",
    openGraph: {
      title: "Student Registration | SUSL Hostel Portal",
      description: "Sign up for hostel accommodation at Sabaragamuwa University.",
      url: `${BASE_URL}/student/signup`,
    },
    alternates: {
      canonical: `${BASE_URL}/student/signup`,
    },
  };
}

export function generateAdminLoginMetadata(): Metadata {
  return {
    title: "Admin Login | SUSL Hostel Management System",
    description: "Administrative access for Sabaragamuwa University hostel management. Manage students, rooms, maintenance, fees, and hostel operations.",
    openGraph: {
      title: "Admin Portal | SUSL Hostel Management",
      description: "Secure admin login for hostel management operations.",
      url: `${BASE_URL}/admin/login`,
    },
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `${BASE_URL}/admin/login`,
    },
  };
}

export function generateStudentDashboardMetadata(): Metadata {
  return {
    title: "Student Dashboard | SUSL Hostel Management",
    description: "Manage your hostel accommodation, view fees, submit requests, and access all hostel services.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export function generateAdminDashboardMetadata(): Metadata {
  return {
    title: "Admin Dashboard | SUSL Hostel Management",
    description: "Comprehensive hostel administration dashboard for managing students, rooms, and operations.",
    robots: {
      index: false,
      follow: false,
    },
  };
}
