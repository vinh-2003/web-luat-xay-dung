"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Toaster } from "sonner";
import { LayoutDashboard, Users, FileText, Settings, LogOut, Loader2, Scale } from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null) {
      router.push("/");
    } else if (user.role !== "admin") {
      router.push("/");
    } else {
      setLoading(false);
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Đang xác thực quyền Quản trị...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navItems = [
    { name: "Tổng quan", href: "/admin", icon: LayoutDashboard },
    { name: "Người dùng", href: "/admin/users", icon: Users },
    { name: "Văn bản", href: "/admin/documents", icon: FileText },
    { name: "Hệ thống", href: "/admin/system", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card flex flex-col z-20">
        <div className="p-6 border-b border-border">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Menu Quản trị
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-muted text-foreground" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-foreground" : "text-muted-foreground"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        

      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
