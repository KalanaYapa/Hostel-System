import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/app/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sabaragamuwa University Hostel Management System | SUSL Student Accommodation",
  description: "Official hostel management system for Sabaragamuwa University of Sri Lanka. Manage student accommodation, hostel fees, room allocation, maintenance requests, late passes, and attendance tracking online.",
  keywords: [
    "Sabaragamuwa University hostel",
    "SUSL hostel management",
    "Sri Lanka university accommodation",
    "student hostel Sri Lanka",
    "hostel booking system",
    "university housing management",
    "Sabaragamuwa student accommodation",
    "hostel fee payment online",
    "room allocation system",
    "university hostel facilities"
  ],
  authors: [{ name: "SPACE SOLUTIONS INTERNATIONAL (PVT) LTD" }],
  creator: "SPACE SOLUTIONS INTERNATIONAL (PVT) LTD",
  publisher: "Sabaragamuwa University of Sri Lanka",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_LK',
    url: 'https://yourdomain.com/',
    siteName: 'Sabaragamuwa University Hostel Management System',
    title: 'SUSL Hostel Management | Student Accommodation Portal',
    description: 'Comprehensive hostel management solution for Sabaragamuwa University students. Manage room bookings, fees, maintenance, and more.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sabaragamuwa University Hostel Management System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SUSL Hostel Management System',
    description: 'Official hostel management portal for Sabaragamuwa University of Sri Lanka students.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://yourdomain.com/',
  },
  category: 'Education',
  classification: 'University Hostel Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="geo.region" content="LK-SAB" />
        <meta name="geo.placename" content="Belihuloya, Sri Lanka" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster position="top-center" richColors expand={true} />
      </body>
    </html>
  );
}
