"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import { toast } from "react-hot-toast";
import { useUser } from "@/hooks/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  userId: number;
  name: string;
  email?: string;
  phone?: string;
  role?: 'user' | 'admin';
  deleted?: boolean;
}

const PAGE_SIZE = 5;

function highlightMatch(text: string, search: string) {
  if (!search) return text;
  const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.split(regex).map((part, i) =>
    regex.test(part)
      ? <span key={i} className="bg-yellow-200 text-blue-900 font-bold rounded px-1 animate-highlight">{part}</span>
      : part
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="py-2 px-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="py-2 px-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="py-2 px-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
      <td className="py-2 px-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="py-2 px-4"><div className="h-4 bg-gray-200 rounded w-8" /></td>
    </tr>
  );
}

const UsersPage = () => {
  const { user, loading } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<'userId'|'name'|'email'|'phone'>('userId');
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'>('asc');
  const [showDeleted, setShowDeleted] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchUsers = async (pageNum = 1, searchQuery = "", sortField = sortBy, sortDir = sortOrder, showDeletedParam = showDeleted) => {
    setUsersLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await axios.get(`/api/users?page=${pageNum}&limit=${PAGE_SIZE}&search=${encodeURIComponent(searchQuery)}&sort=${sortField}&order=${sortDir}&showDeleted=${showDeletedParam}`,
        { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data.users);
      setTotalPages(res.data.pages);
      setPage(res.data.page);
      setTotal(res.data.total);
    } catch (err) {
      // handle error
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    fetchUsers(page, search, sortBy, sortOrder, showDeleted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, sortBy, sortOrder, showDeleted]);

  const handleDelete = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setDeletingId(userId);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("User deleted successfully.");
      fetchUsers(page, search, sortBy, sortOrder, showDeleted);
    } catch (err) {
      toast.error("Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSort = (field: 'userId'|'name'|'email'|'phone') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // Always keep the search input focused after every render
  useEffect(() => {
    if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
      searchInputRef.current.focus();
    }
  });

  // Show spinner while loading auth state
  if (loading) return (
    <div className="w-full h-[60vh] flex items-center justify-center">
      <Spinner />
    </div>
  );

  if (usersLoading) return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h1 className="text-2xl font-bold text-blue-700 mb-2">All Users</h1>
      <div className="mb-4 text-gray-700 font-medium">Total: ...</div>
      <form className="mb-4 flex gap-2">
        <input disabled className="flex-1 px-4 py-2 border border-gray-300 rounded-md bg-gray-100" />
        <button disabled className="px-4 py-2 rounded bg-blue-200 text-white font-semibold">Search</button>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-blue-100 sticky top-0 z-10">
            <tr>
              <th className="py-2 px-4 text-left text-blue-700">User ID</th>
              <th className="py-2 px-4 text-left text-blue-700">Name</th>
              <th className="py-2 px-4 text-left text-blue-700">Email</th>
              <th className="py-2 px-4 text-left text-blue-700">Phone</th>
              <th className="py-2 px-4 text-left text-blue-700">Role</th>
              <th className="py-2 px-4 text-left text-blue-700" style={{minWidth: '120px'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8 sm:p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-blue-700">All Users</h1>
        <label className="flex items-center gap-2 cursor-pointer select-none font-medium">
          <span className="text-sm text-gray-700">Show Deleted Users</span>
          <button
            type="button"
            onClick={() => setShowDeleted(v => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${showDeleted ? 'bg-blue-600' : 'bg-gray-300'}`}
            aria-pressed={showDeleted}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${showDeleted ? 'translate-x-5' : 'translate-x-1'}`}
            />
          </button>
        </label>
      </div>
      <div className="mb-4 text-gray-700 font-medium">Total: {total}</div>
      <form className="mb-4 flex gap-2 relative" onSubmit={e => e.preventDefault()}>
        <div className="relative flex-1">
          <input
            ref={searchInputRef}
            type="text"
            value={searchInput}
            onChange={e => {
              setSearchInput(e.target.value);
              // Always keep focus on input after change
              searchInputRef.current?.focus();
            }}
            placeholder="Search by name, email, or phone..."
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900"
            aria-label="Search users"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => { setSearchInput(""); setSearch(""); setPage(1); searchInputRef.current?.focus(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
              tabIndex={0}
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          tabIndex={-1}
          style={{ display: 'none' }}
        >
          Search
        </button>
      </form>
      <div className="relative overflow-x-auto">
        {/* Overlay spinner during loading */}
        {usersLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10 transition-opacity animate-fade-in">
            <Spinner />
          </div>
        )}
        <table className="w-full border-collapse">
          <thead className="bg-blue-100 sticky top-0 z-10">
            <tr>
              <th className="py-2 px-4 text-left text-blue-700 cursor-pointer select-none" onClick={() => handleSort('userId')}>
                User ID {sortBy === 'userId' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className="py-2 px-4 text-left text-blue-700 cursor-pointer select-none" onClick={() => handleSort('name')}>
                Name {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className="py-2 px-4 text-left text-blue-700 cursor-pointer select-none" onClick={() => handleSort('email')}>
                Email {sortBy === 'email' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className="py-2 px-4 text-left text-blue-700 cursor-pointer select-none" onClick={() => handleSort('phone')}>
                Phone {sortBy === 'phone' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className="py-2 px-4 text-left text-blue-700">Role</th>
              {user?.role === 'admin' && (
                <th className="py-2 px-4 text-left text-blue-700" style={{minWidth: '120px'}}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody className={usersLoading ? 'opacity-50' : 'transition-opacity duration-500 opacity-100'}>
            {users.length === 0 ? (
              <tr>
                <td colSpan={user?.role === 'admin' ? 6 : 5} className="py-8 text-center text-gray-400 text-lg">
                  <div className="flex flex-col items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2m-4-4a4 4 0 00-8 0v2m8-2a4 4 0 00-8 0v2m8-2a4 4 0 00-8 0v2" /></svg>
                    No users found.
                  </div>
                </td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.userId} className={`border-b hover:bg-blue-50 transition-colors ${u.deleted ? 'bg-gray-100 text-gray-400 line-through' : ''} animate-fade-in`}>
                  <td className="py-2 px-4 font-mono text-gray-800">{u.userId}</td>
                  <td className="py-2 px-4 text-gray-800">{highlightMatch(u.name || "", search)}</td>
                  <td className="py-2 px-4 text-gray-800">{highlightMatch(u.email || "", search) || <span className="italic text-gray-400">N/A</span>}</td>
                  <td className="py-2 px-4 text-gray-800">{highlightMatch(u.phone || "", search) || <span className="italic text-gray-400">N/A</span>}</td>
                  <td className="py-2 px-4 text-gray-800">
                    {user?.role === 'admin' && user.userId !== u.userId ? (
                      <select
                        value={u.role || 'user'}
                        disabled={u.deleted}
                        onChange={async (e) => {
                          try {
                            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                            await axios.patch(`/api/users/${u.userId}`, { role: e.target.value }, {
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            toast.success('Role updated');
                            fetchUsers(page, search, sortBy, sortOrder, showDeleted);
                          } catch {
                            toast.error('Failed to update role');
                          }
                        }}
                        className="border rounded px-2 py-1"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className="capitalize">{u.role || 'user'}</span>
                    )}
                  </td>
                  {user?.role === 'admin' && (
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-3">
                        {u.deleted ? (
                          <button
                            onClick={async () => {
                              try {
                                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                                await axios.patch(`/api/users/${u.userId}`, { deleted: false }, {
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                toast.success('User restored');
                                fetchUsers(page, search, sortBy, sortOrder, showDeleted);
                              } catch {
                                toast.error('Failed to restore user');
                              }
                            }}
                            className="p-2 rounded bg-green-100 hover:bg-green-200 text-green-700 font-semibold transition-colors cursor-pointer"
                          >
                            Restore
                          </button>
                        ) : (
                          <>
                            <Link
                              href={`/users/${u.userId}/edit`}
                              className="p-2 rounded hover:bg-blue-100 focus:bg-blue-200 transition-colors cursor-pointer"
                              title="Edit user"
                              aria-label={`Edit user ${u.name || u.email || u.userId}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-blue-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3zm0 0v3h3" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleDelete(u.userId)}
                              className="p-2 rounded hover:bg-red-100 focus:bg-red-200 transition-colors cursor-pointer disabled:opacity-50"
                              disabled={deletingId === u.userId}
                              title="Delete user"
                              aria-label={`Delete user ${u.name || u.email || u.userId}`}
                            >
                              {deletingId === u.userId ? (
                                <span className="text-red-600 font-semibold">...</span>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-red-600">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
                                </svg>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 gap-2 flex-wrap">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`px-3 py-1 rounded ${num === page ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"} font-semibold`}
                disabled={num === page}
              >
                {num}
              </button>
            ))}
          </div>
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

export default UsersPage; 