"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuthRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          router.push("/login");
          setLoading(false);
          return;
        }
        // Optionally, you can call your profile API here with the token
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  return loading;
} 