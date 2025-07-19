"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Spinner from "../../../components/Spinner";
import { toast } from "react-hot-toast";
import { useUser } from "@/hooks/UserContext";

const EditUserPage = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId;
  const { user: currentUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "user" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await axios.get(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForm({
          name: res.data.user.name || "",
          email: res.data.user.email || "",
          phone: res.data.user.phone || "",
          role: res.data.user.role || "user"
        });
      } catch (err) {
        toast.error("Failed to fetch user.");
        router.push("/users");
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await axios.patch(`/api/users/${userId}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("User updated successfully.");
      router.push("/users");
    } catch (err) {
      toast.error("Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center w-full h-full"><Spinner /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-xl relative">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Edit User</h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-black mb-1">Name</label>
            <input
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
          {currentUser?.role === 'admin' && (
            <div>
              <label className="block text-sm font-bold text-black mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 px-4 rounded-md text-white font-semibold transition-colors duration-200 bg-blue-600 hover:bg-blue-700"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="flex-1 py-2 px-4 rounded-md text-blue-700 font-semibold border border-blue-600 bg-white hover:bg-blue-50 transition-colors duration-200"
              onClick={() => router.push('/users')}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserPage; 