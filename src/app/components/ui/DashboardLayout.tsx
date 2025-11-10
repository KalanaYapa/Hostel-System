"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  DollarSign,
  Wrench,
  Shield,
  BarChart3,
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Phone,
  CreditCard,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";


interface DashboardLayoutProps {
  children: ReactNode;
}

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Students", path: "/students" },
  { icon: ClipboardCheck, label: "Attendance", path: "/attendance" },
  { icon: DollarSign, label: "Finance", path: "/finance" },
  { icon: Wrench, label: "Maintenance", path: "/maintenance" },
  { icon: Shield, label: "Security", path: "/security" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
];

const studentMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/student-dashboard" },
  { icon: ClipboardCheck, label: "Attendance", path: "/student-attendance" },
  { icon: Wrench, label: "Maintenance", path: "/student-maintenance" },
  { icon: CreditCard, label: "Payments", path: "/student-payments" },
  { icon: Phone, label: "Emergency Contacts", path: "/student-emergency" },
  { icon: User, label: "Profile", path: "/student-profile" },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // For demo purposes, simulate admin role - you can change this to 'student' to see student menu
  const userRole = 'admin'; // Change to 'student' to see student menu

  const menuItems = userRole === 'admin' ? adminMenuItems : studentMenuItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed left-0 top-0 z-40 h-screen w-72 glass rounded-r-3xl border-r border-border/50"
          >
            <div className="flex h-full flex-col">
              {/* Logo */}
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <div>
                  <h1 className="text-2xl font-bold text-primary">Hostel MS</h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sabaragamuwa University
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden hover:bg-primary/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
                {menuItems.map((item, index) => {
                  const isActive = pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "text-foreground/70 hover:bg-primary/10 hover:text-foreground"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* User Profile */}
              <div className="p-4 border-t border-border/50">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 px-4 py-6 h-auto hover:bg-primary/10 rounded-2xl"
                    >
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                        <AvatarImage src={`https://avatar.vercel.sh/${userRole === 'admin' ? 'admin' : 'student'}`} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {userRole === 'admin' ? 'AD' : 'ST'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-sm">{userRole === 'admin' ? 'Admin User' : 'Student User'}</p>
                        <p className="text-xs text-muted-foreground">
                          {userRole === 'admin' ? 'admin@hostel.edu' : 'student@hostel.edu'}
                        </p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-72" : "ml-0"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-primary/10 rounded-xl"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-primary/10 rounded-xl"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                  3
                </span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
