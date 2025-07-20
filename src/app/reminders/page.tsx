"use client";
import React from "react";
import { useUser } from "@/hooks/UserContext";
import { useRouter } from "next/navigation";

const RemindersPage = () => {
  const { user, loading } = useUser();
  const router = useRouter();

  if (!loading && (!user || (user.role !== "admin" && user.role !== "superadmin"))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-700">You do not have permission to view reminders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Reminders</h1>
      <div className="text-gray-600">(Reminders functionality coming soon...)</div>
    </div>
  );
};

export default RemindersPage; 