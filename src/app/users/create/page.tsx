"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const AddUserPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'user', organisationId: '' });
  const [loading, setLoading] = useState(false);
  const [organisations, setOrganisations] = useState([]);

  useEffect(() => {
    // Only fetch organisations if not superadmin
    if (form.role !== 'superadmin') {
      const fetchOrganisations = async () => {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          const res = await axios.get('/api/organisations', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setOrganisations(res.data.organisations || []);
        } catch (err) {
          toast.error('Failed to fetch organisations');
        }
      };
      fetchOrganisations();
    }
  }, [form.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Require organisationId for non-superadmin
    if (form.role !== 'superadmin' && !form.organisationId) {
      toast.error('Please select an organisation');
      return;
    }
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await axios.post('/api/users/signup', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User created successfully');
      router.push('/users');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Add User</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div>
            <label className="block text-sm font-bold text-black mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-500"
              required
            />
          </div>
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
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
          {/* Organisation dropdown for non-superadmin */}
          {form.role !== 'superadmin' && (
            <div>
              <label className="block text-sm font-bold text-black mb-1">Organisation</label>
              <select
                name="organisationId"
                value={form.organisationId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900"
                required
              >
                <option value="">Select organisation</option>
                {organisations.map((org: any) => (
                  <option key={org._id} value={org._id}>{org.name}</option>
                ))}
              </select>
            </div>
          )}
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md text-white font-semibold transition-colors duration-200 bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUserPage; 