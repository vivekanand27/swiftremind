"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const HomePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name?: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/users/profile");
        if (res.status !== 200) {
          router.push("/login");
        } else {
          setUser(res.data.user);
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await axios.post('/api/users/logout');
    router.push('/logout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
        <div className="text-blue-700 text-xl font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-4 text-center">
          {user?.name ? `Welcome, ${user.name}!` : 'Welcome to SwiftRemind!'}
        </h1>
        <p className="text-lg text-gray-700 mb-8 text-center">
          Your smart, simple reminder app. Organize your tasks, set reminders, and stay productive with ease.
        </p>
        <button
          onClick={handleLogout}
          className="mt-4 px-6 py-2 rounded-md bg-blue-600 text-white font-semibold text-lg shadow hover:bg-blue-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default HomePage;
