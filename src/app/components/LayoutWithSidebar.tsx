"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { UserProvider } from "@/hooks/UserContext";
import { Toaster } from "react-hot-toast";
import React from "react";

export default function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
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
      {!isAuthPage && <Sidebar />}
      <div className="flex-1 flex flex-col min-h-screen" style={!isAuthPage ? { marginLeft: 240 } : {}}>
        <main className="flex-1 flex items-center justify-center">
          {children}
        </main>
      </div>
    </UserProvider>
  );
} 