"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface User {
  userId?: number;
  name?: string;
  email?: string;
  phone?: string;
  role?: 'superadmin' | 'admin' | 'user';
  // Add other user fields as needed
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();

    const handleProfileUpdate = () => fetchProfile();
    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("profile-updated", handleProfileUpdate);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}; 