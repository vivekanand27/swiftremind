"use client"
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SignupPage() {
    const [user, setUser] = useState({
        email: "",
        password: "",
        username: "",
    });
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const onSignup = async () => {
        try {
            setLoading(true);
            const response = await axios.post("/api/users/signup", user);
            console.log(response.data);
        } catch (error: any) {
            console.log(error.response.data);
        }
    }

    return (<div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 >Signup</h1>
        <hr />
        <label htmlFor="username">Username</label>
        <input className="p-2 border border-gray-300 rounded-md" id="username" type="text" value={user.username} onChange={(e) => setUser({ ...user, username: e.target.value })} placeholder="Username" />
        <label htmlFor="email">Email</label>
        <input className="p-2 border border-gray-300 rounded-md" id="email" type="text" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} placeholder="Email" />
        <label htmlFor="password">Password</label>
        <input className="p-2 border border-gray-300 rounded-md" id="password" type="password" value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} placeholder="Password" />
        <button onClick={onSignup} className="p-2 border border-gray-300 rounded-md bg-blue-500 text-white">
            {buttonDisabled ? "No Signup" : "Signup"}
        </button>
        <Link href="/login">Visit Login</Link>
    </div>);
}