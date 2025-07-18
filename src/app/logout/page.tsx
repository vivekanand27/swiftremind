"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Here you would clear auth/session if implemented
    const timer = setTimeout(() => {
      router.push("/login");
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">You have been logged out</h1>
        <p className="text-gray-700 text-center">Redirecting to login page...</p>
      </div>
    </div>
  );
};

export default LogoutPage; 