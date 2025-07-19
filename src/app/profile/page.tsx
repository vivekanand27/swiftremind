"use client";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const loading = useAuthRedirect();
  const [user, setUser] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [formLoading, setFormLoading] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Force light mode on mount
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  useEffect(() => {
    if (modalOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [modalOpen]);

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

  const openModal = () => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      password: "",
      confirmPassword: ""
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setFormLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    try {
      const payload: any = { name: form.name, email: form.email, phone: form.phone };
      if (form.password) payload.password = form.password;
      const res = await axios.patch("/api/users/profile", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
      toast.success("Profile updated successfully!");
      window.dispatchEvent(new Event("profile-updated"));
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center w-full h-full"><Spinner /></div>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 min-w-[320px] mx-auto flex flex-col items-center">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Profile</h1>
      {user && (
        <div className="space-y-2">
          <div><span className="font-extrabold text-black">User ID:</span> <span className="font-bold text-gray-900">{user.userId || <span className="italic text-gray-400">Not provided</span>}</span></div>
          <div><span className="font-extrabold text-black">Name:</span> <span className="font-bold text-gray-900">{user.name || <span className="italic text-gray-400">Not provided</span>}</span></div>
          <div><span className="font-extrabold text-black">Email:</span> <span className="font-bold text-gray-900">{user.email || <span className="italic text-gray-400">Not provided</span>}</span></div>
          <div><span className="font-extrabold text-black">Phone:</span> <span className="font-bold text-gray-900">{user.phone || <span className="italic text-gray-400">Not provided</span>}</span></div>
        </div>
      )}
      <button
        onClick={openModal}
        className="mt-6 px-6 py-2 rounded-md bg-blue-600 text-white font-semibold text-lg shadow hover:bg-blue-700 transition-colors w-full cursor-pointer"
      >
        Edit Profile
      </button>
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold cursor-pointer"
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold text-blue-700 mb-4">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1">Name</label>
                <input
                  ref={nameInputRef}
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">New Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-500"
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-500"
                  placeholder="Confirm new password"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-md text-white font-semibold transition-colors duration-200 bg-blue-600 hover:bg-blue-700 cursor-pointer"
                disabled={formLoading}
              >
                {formLoading ? <Spinner /> : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}