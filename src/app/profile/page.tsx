"use client";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function ProfilePage() {
  const loading = useAuthRedirect();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-700 text-xl font-semibold animate-pulse">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Profile</h1>
        {/* Add more profile details here */}
      </div>
    </div>
  );
}