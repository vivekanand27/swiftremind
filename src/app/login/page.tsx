"use client";
import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Spinner from "../components/Spinner";
import { useUser } from "@/hooks/UserContext";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();
  const { user, loading } = useUser();

  React.useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [loading, user, router]);

  const buttonDisabled = formLoading; // Only disable when loading

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdentifierError("");
    setPasswordError("");
    setFormLoading(true);
    let hasError = false;
    if (!identifier) {
      setIdentifierError("Email or phone is required.");
      hasError = true;
    }
    if (!password) {
      setPasswordError("Password is required.");
      hasError = true;
    }
    if (hasError) {
      setFormLoading(false);
      return;
    }
    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      const payload = isEmail ? { email: identifier, password } : { phone: identifier, password };
      const res = await axios.post("/api/users/login", payload);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        window.dispatchEvent(new Event("profile-updated"));
        toast.success("Login successful!");
        router.push("/");
      } else {
        toast.error("No token received from server.");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "An error occurred. Please try again."
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 relative">
      {formLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-50">
          <Spinner />
        </div>
      )}
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">Login</h1>
        <form onSubmit={onLogin} className="space-y-5">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">Email or Phone Number</label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              placeholder="Enter your email or phone number"
              required
              className="w-full px-4 py-2 border border-gray-500 bg-gray-100 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {identifierError && (
              <div className="text-red-600 text-xs mt-1">{identifierError}</div>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2 border border-gray-500 bg-gray-100 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {passwordError && (
              <div className="text-red-600 text-xs mt-1">{passwordError}</div>
            )}
          </div>
          <button
            type="submit"
            disabled={buttonDisabled}
            className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-colors duration-200 ${buttonDisabled ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"}`}
          >
            {formLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline font-medium cursor-pointer">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;