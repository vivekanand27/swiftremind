"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import Spinner from "../../components/Spinner";

const AddOrganisationPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', type: '', contactEmail: '', phone: '', city: '' });
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone' && value.length > 10) return;
    setForm({ ...form, [name]: value });
    if (name === 'phone' && value.length > 10) {
      setPhoneError('Phone number cannot exceed 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await axios.post('/api/organisations', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Organisation added successfully');
      router.push('/organisations');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add organisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Add Organisation</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={loading} className="space-y-4">
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
              <label className="block text-sm font-bold text-black mb-1">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900"
                required
              >
                <option value="">Select type</option>
                <option value="school">School</option>
                <option value="shop">Shop</option>
                <option value="gym">Gym</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={form.contactEmail}
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
                maxLength={10}
                required
              />
              {phoneError && <div className="text-red-600 text-xs mt-1">{phoneError}</div>}
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">City</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-500"
                required
              />
            </div>
          </fieldset>
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md text-white font-semibold transition-colors duration-200 bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <Spinner /> : "Add Organisation"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddOrganisationPage; 