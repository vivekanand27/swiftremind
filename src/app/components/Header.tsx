"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/UserContext";
import Spinner from "./Spinner";
import axios from "axios";

const Header = () => {
  const { user, loading, setUser } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      await axios.post('/api/users/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      setUser(null);
    }
    router.push('/logout');
  };

  if (loading) {
    return (
      <header className="w-full bg-white dark:bg-gray-900 shadow flex items-center border-b border-gray-200 dark:border-gray-800 px-4 py-1 fixed top-0 left-0 z-50 h-14">
        <div className="flex-1" />
        <Spinner />
      </header>
    );
  }

  if (!user) return null;

  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow flex items-center border-b border-gray-200 dark:border-gray-800 px-4 py-1 fixed top-0 left-0 z-50 h-14">
      <div className="flex items-center flex-1 gap-4">
        <button
          onClick={() => router.push("/")}
          className="px-3 py-1 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-bold text-xl hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-pointer"
        >
          SwiftRemind
        </button>
      </div>
      <div className="flex items-center">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((open) => !open)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <span className="truncate max-w-[120px]">{user.name || user.email || user.phone || "User"}</span>
            <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-50 border border-gray-100 dark:border-gray-700">
              <Link
                href="/profile"
                className="block px-4 py-2 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Profile
              </Link>
              <Link
                href="/users"
                className="block px-4 py-2 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Users
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 