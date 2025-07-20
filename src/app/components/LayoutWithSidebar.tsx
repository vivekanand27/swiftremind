"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { UserProvider } from "@/hooks/UserContext";
import { Toaster } from "react-hot-toast";
import React, { useState, useEffect } from "react";

export default function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  useEffect(() => {
    const handleLogoutOnClose = () => {
      // Remove token from localStorage
      localStorage.removeItem("token");
      // Use sendBeacon for best-effort logout API call
      const url = "/api/users/logout";
      const data = new Blob([], { type: 'application/json' });
      navigator.sendBeacon(url, data);
    };
    window.addEventListener("beforeunload", handleLogoutOnClose);
    return () => {
      window.removeEventListener("beforeunload", handleLogoutOnClose);
    };
  }, []);

  return (
    <UserProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
          },
          success: {
            style: {
              background: '#22c55e',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
      {!isAuthPage && <Sidebar onCollapseChange={setSidebarCollapsed} />}
      <div 
        className="flex-1 flex flex-col min-h-screen transition-all duration-200 bg-gradient-to-br from-blue-50 to-blue-100" 
        style={!isAuthPage ? { marginLeft: sidebarCollapsed ? 64 : 240 } : {}}
      >
        <main className="flex-1 flex items-center justify-center">
          {children}
        </main>
      </div>
    </UserProvider>
  );
} 