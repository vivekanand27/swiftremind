"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useUser } from "@/hooks/UserContext";

const EditCustomerPage = () => {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.customerId;
  const { user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userLoading && (!user || (user.role !== "admin" && user.role !== "superadmin"))) {
      router.replace("/customers");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) return;
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await axios.get(`/api/customers/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForm(res.data.customer);
        setNotFound(false);
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [customerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await axios.patch(`/api/customers/${customerId}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Customer updated successfully.");
      router.push("/customers");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update customer");
    } finally {
      setSaving(false);
    }
  };

  if (userLoading || loading) return <div className="flex items-center justify-center w-full h-full">Loading...</div>;
  if (notFound) return <div className="flex items-center justify-center w-full h-full text-red-600 text-xl">404 | Customer not found</div>;
  if (!form) return null;

  const handleRestore = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await axios.patch(`/api/customers/${customerId}`, { deleted: false }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Customer restored.");
      router.replace(`/customers/${customerId}`);
    } catch (err) {
      toast.error("Failed to restore customer");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-xl relative">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Edit Customer</h2>
        {form.deleted && (
          <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded">
            This customer is deleted. You can restore them to make them active again.
            <button
              onClick={handleRestore}
              className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
            >
              Undo Delete
            </button>
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-black mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-black mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-black mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-black mb-1">Business Name</label>
            <input
              type="text"
              name="businessName"
              value={form.businessName || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900"
            />
          </div>
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
              onClick={() => router.push('/customers')}
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

export default EditCustomerPage; 