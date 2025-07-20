"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { HiOutlineTrash, HiOutlinePencil, HiOutlineCurrencyRupee, HiOutlineCalendar, HiOutlineShieldCheck, HiOutlineFunnel } from "react-icons/hi2";
import { useUser } from "@/hooks/UserContext";
import { toast } from "react-hot-toast";

const CustomersPage = () => {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    customerType: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [undoingId, setUndoingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ id: string | null, name: string }>({ id: null, name: "" });

  const fetchCustomers = async (pageNum = 1, searchQuery = "", filterParams = filters) => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const params = new URLSearchParams({
        page: pageNum.toString(),
        search: searchQuery,
        status: filterParams.status,
        customerType: filterParams.customerType,
        sortBy: filterParams.sortBy,
        sortOrder: filterParams.sortOrder
      });
      
      const res = await axios.get(`/api/customers?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(res.data.customers);
      setTotalPages(res.data.pages);
      setPage(res.data.page);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId: string, name: string) => {
    setShowConfirm({ id: customerId, name });
  };
  const confirmDelete = async () => {
    if (!showConfirm.id) return;
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await axios.delete(`/api/customers/${showConfirm.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Customer deleted.');
      fetchCustomers(page, search, filters);
    } catch (error) {
      toast.error('Failed to delete customer.');
    } finally {
      setLoading(false);
      setShowConfirm({ id: null, name: "" });
    }
  };
  const handleUndo = async (customerId: string) => {
    setUndoingId(customerId);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await axios.patch(`/api/customers/${customerId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Customer restored.');
      fetchCustomers(page, search, filters);
    } catch (error) {
      toast.error('Failed to restore customer.');
    } finally {
      setUndoingId(null);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchCustomers(1, search, newFilters);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Current": return "bg-green-100 text-green-800";
      case "Overdue": return "bg-red-100 text-red-800";
      case "Paid": return "bg-blue-100 text-blue-800";
      case "Delinquent": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number, currency: string = "INR") => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  useEffect(() => {
    fetchCustomers(page, search, filters);
  }, [page, search]);

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Customers</h1>
        <button
          onClick={() => router.push("/customers/create")}
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow"
        >
          + Add Customer
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, email, business name, or GST..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <HiOutlineFunnel size={20} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">All Status</option>
                <option value="Current">Current</option>
                <option value="Overdue">Overdue</option>
                <option value="Paid">Paid</option>
                <option value="Delinquent">Delinquent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
              <select
                value={filters.customerType}
                onChange={(e) => handleFilterChange("customerType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">All Types</option>
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Retail">Retail</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="createdAt">Date Created</option>
                <option value="name">Name</option>
                <option value="pendingAmount">Pending Amount</option>
                <option value="dueDate">Due Date</option>
                <option value="paymentStatus">Payment Status</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Customers Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-blue-100">
            <tr>
              <th className="py-3 px-4 text-left text-blue-700 font-semibold">Customer</th>
              <th className="py-3 px-4 text-left text-blue-700 font-semibold">Contact</th>
              <th className="py-3 px-4 text-left text-blue-700 font-semibold">
                <HiOutlineCurrencyRupee className="inline mr-1" />
                Pending Amount
              </th>
              <th className="py-3 px-4 text-left text-blue-700 font-semibold">
                <HiOutlineCalendar className="inline mr-1" />
                Due Date
              </th>
              <th className="py-3 px-4 text-left text-blue-700 font-semibold">
                <HiOutlineShieldCheck className="inline mr-1" />
                Status
              </th>
              <th className="py-3 px-4 text-left text-blue-700 font-semibold">Type</th>
              <th className="py-3 px-4 text-left text-blue-700 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No customers found.</td></tr>
            ) : (
              customers.map(c => (
                <tr key={c._id} className={`border-b hover:bg-gray-50 ${c.deleted ? 'bg-gray-100 text-gray-400' : ''}`}>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-semibold text-gray-900">{c.name}</div>
                      {c.businessName && (
                        <div className="text-sm text-gray-500">{c.businessName}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <div className="font-medium">{c.phone}</div>
                      {c.email && <div className="text-gray-500">{c.email}</div>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold">
                      {formatCurrency(c.pendingAmount || 0, c.currency)}
                    </div>
                    {c.creditLimit > 0 && (
                      <div className="text-xs text-gray-500">
                        Limit: {formatCurrency(c.creditLimit, c.currency)}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      {formatDate(c.dueDate)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(c.paymentStatus)}`}>
                      {c.paymentStatus}
                    </span>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(c.riskLevel)}`}>
                        {c.riskLevel} Risk
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{c.customerType}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {(user?.role === 'admin' || user?.role === 'superadmin') && (
                        <>
                          {!c.deleted ? (
                            <>
                              <button
                                onClick={() => router.push(`/customers/${c._id}`)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Edit customer"
                              >
                                <HiOutlinePencil size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(c._id, c.name)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Delete customer"
                              >
                                <HiOutlineTrash size={18} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleUndo(c._id)}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Undo delete"
                              disabled={undoingId === c._id}
                            >
                              {undoingId === c._id ? 'Restoring...' : 'Undo'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50 hover:bg-blue-200"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50 hover:bg-blue-200"
          >
            Next
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm.id && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-red-700">Delete Customer</h2>
            <p className="mb-6">Are you sure you want to delete <span className="font-semibold">{showConfirm.name}</span>? This action can be undone.</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirm({ id: null, name: "" })}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage; 