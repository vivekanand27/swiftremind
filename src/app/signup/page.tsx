"use client";
import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const SignupPage = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Validation helpers
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) => /^\d{10,15}$/.test(phone);
  const isValidPassword = (password: string) => password.length >= 6;

  const isFormValid = () => {
    if (!name) return false;
    if (!email && !phone) return false;
    if (email && !isValidEmail(email)) return false;
    if (phone && !isValidPhone(phone)) return false;
    if (!isValidPassword(password)) return false;
    if (password !== confirmPassword) return false;
    return true;
  };

  const buttonDisabled = loading || !isFormValid();

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email && !phone) {
      toast.error("Please enter either an email or a phone number.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/users/signup", { name, email, phone, password });
      toast.success("Signup successful! You can now log in.");
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">Sign Up</h1>
        <form onSubmit={onSignup} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="w-full px-4 py-2 border border-gray-500 bg-gray-100 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email (optional)"
              className="w-full px-4 py-2 border border-gray-500 bg-gray-100 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="flex items-center my-2">
            <div className="flex-grow h-px bg-gray-300" />
            <span className="mx-3 text-gray-500 font-semibold">OR</span>
            <div className="flex-grow h-px bg-gray-300" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter your phone number (optional)"
              className="w-full px-4 py-2 border border-gray-500 bg-gray-100 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2 border border-gray-500 bg-gray-100 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <div className={`mt-1 text-xs rounded px-2 py-1 ${password.length === 0 ? 'text-gray-500 bg-gray-50 border border-gray-100' : password.length >= 6 ? 'text-green-700 bg-green-50 border border-green-200' : 'text-red-700 bg-red-50 border border-red-200'}`}>
              Password must be at least 6 characters long.
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="w-full px-4 py-2 border border-gray-500 bg-gray-100 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <div className={`mt-1 text-xs rounded px-2 py-1 ${confirmPassword.length === 0 ? 'text-gray-500 bg-gray-50 border border-gray-100' : confirmPassword === password ? 'text-green-700 bg-green-50 border border-green-200' : 'text-red-700 bg-red-50 border border-red-200'}`}>
              {confirmPassword.length === 0 ? 'Please confirm your password.' : confirmPassword === password ? 'Passwords match.' : 'Passwords do not match.'}
            </div>
          </div>
          <button
            type="submit"
            disabled={buttonDisabled}
            className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-colors duration-200 ${buttonDisabled ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;