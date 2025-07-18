"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Spinner from "./components/Spinner";
import axios from "axios";
import { useUser } from "@/hooks/UserContext";

const HomePage = () => {
  const router = useRouter();
  const { user, loading, setUser } = useUser();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center mx-auto">
      <h1 className="text-4xl font-extrabold text-blue-700 mb-4 text-center">
        {user?.name ? `Welcome, ${user.name}!` : 'Welcome to SwiftRemind!'}
      </h1>
      <p className="text-lg text-gray-700 mb-8 text-center">
        Your smart, simple reminder app. Organize your tasks, set reminders, and stay productive with ease.
      </p>
     
    </div>
  );
};

export default HomePage;
