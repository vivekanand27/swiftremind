"use client";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ProfilePage() {
  const loading = useAuthRedirect();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;
      try {
        const res = await axios.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
      } catch {
        // ignore, already redirected by useAuthRedirect
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-700 text-xl font-semibold animate-pulse">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Profile</h1>
        {user && (
          <div className="text-gray-700">
            <div><span className="font-semibold">Name:</span> {user.name}</div>
            {user.email && <div><span className="font-semibold">Email:</span> {user.email}</div>}
            {user.phone && <div><span className="font-semibold">Phone:</span> {user.phone}</div>}
          </div>
        )}
      </div>
    </div>
  );
}