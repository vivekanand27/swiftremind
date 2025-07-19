"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { HiOutlineTrash, HiOutlinePencilSquare } from "react-icons/hi2";

const OrganisationsPage = () => {
  const router = useRouter();
  const [organisations, setOrganisations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrganisations = async (pageNum = 1) => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await axios.get(`/api/organisations?page=${pageNum}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrganisations(res.data.organisations);
      setTotalPages(res.data.pages || 1);
      setPage(res.data.page || 1);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (organisationId: string) => {
    if (!window.confirm("Are you sure you want to delete this organisation? This action cannot be undone.")) return;
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await axios.delete(`/api/organisations/${organisationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrganisations(page);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // Always reset to first page on mount
  }, []);

  useEffect(() => {
    fetchOrganisations(page);
  }, [page]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8 mt-8 text-gray-900">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-blue-700">Organisations</h1>
          <button
            onClick={() => router.push("/organisations/create")}
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow"
          >
            + Add Organisation
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-blue-100">
              <tr>
                <th className="py-2 px-4 text-left text-blue-700">Name</th>
                <th className="py-2 px-4 text-left text-blue-700">Type</th>
                <th className="py-2 px-4 text-left text-blue-700">Contact Email</th>
                <th className="py-2 px-4 text-left text-blue-700">City</th>
                <th className="py-2 px-4 text-left text-blue-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b animate-pulse">
                      <td className="py-2 px-4">
                        <div className="h-4 bg-blue-100 rounded w-3/4" />
                      </td>
                      <td className="py-2 px-4">
                        <div className="h-4 bg-blue-100 rounded w-1/2" />
                      </td>
                      <td className="py-2 px-4">
                        <div className="h-4 bg-blue-100 rounded w-2/3" />
                      </td>
                      <td className="py-2 px-4">
                        <div className="h-4 bg-blue-100 rounded w-1/3" />
                      </td>
                      <td className="py-2 px-4">
                        <div className="h-4 bg-blue-100 rounded w-8" />
                      </td>
                    </tr>
                  ))}
                </>
              ) : organisations.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No organisations found.</td></tr>
              ) : (
                organisations.filter(o => !o.deleted).map(o => (
                  <tr key={o._id} className="border-b">
                    <td className="py-2 px-4">{o.name}</td>
                    <td className="py-2 px-4">{o.type}</td>
                    <td className="py-2 px-4">{o.contactEmail || <span className="italic text-gray-400">N/A</span>}</td>
                    <td className="py-2 px-4">{o.city || <span className="italic text-gray-400">N/A</span>}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => router.push(`/organisations/${o._id}`)}
                        className="text-blue-600 hover:bg-blue-50 rounded p-1 mr-2"
                        title="Edit organisation"
                      >
                        <HiOutlinePencilSquare size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(o._id)}
                        className="text-red-600 hover:bg-red-50 rounded p-1"
                        title="Delete organisation"
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

export default OrganisationsPage; 