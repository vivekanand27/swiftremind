"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { HiOutlineTrash } from "react-icons/hi2";

const CustomersPage = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomers = async (pageNum = 1, searchQuery = "") => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await axios.get(`/api/customers?page=${pageNum}&search=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(res.data.customers);
      setTotalPages(res.data.pages);
      setPage(res.data.page);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId: string) => {
    if (!window.confirm("Are you sure you want to delete this customer? This action cannot be undone.")) return;
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await axios.delete(`/api/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCustomers(page, search);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-blue-700">Customers</h1>
        <button
          onClick={() => router.push("/customers/create")}
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow"
        >
          + Add Customer
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone, or email..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-blue-100">
            <tr>
              <th className="py-2 px-4 text-left text-blue-700">Name</th>
              <th className="py-2 px-4 text-left text-blue-700">Phone</th>
              <th className="py-2 px-4 text-left text-blue-700">Email</th>
              <th className="py-2 px-4 text-left text-blue-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8">Loading...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">No customers found.</td></tr>
            ) : (
              customers.map(c => (
                <tr key={c._id} className="border-b">
                  <td className="py-2 px-4">{c.name}</td>
                  <td className="py-2 px-4">{c.phone}</td>
                  <td className="py-2 px-4">{c.email || <span className="italic text-gray-400">N/A</span>}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => router.push(`/customers/${c._id}`)}
                      className="text-blue-600 hover:underline mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="text-red-600 hover:bg-red-50 rounded p-1"
                      title="Delete customer"
                    >
                      <HiOutlineTrash size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomersPage; 