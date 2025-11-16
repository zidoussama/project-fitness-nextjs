// app/auth/signin/page.tsx
'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function SignIn() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.message);
      setLoading(false);
      return;
    }

    // Auto sign-in after register
    const signInRes = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (signInRes?.ok) {
      window.location.href = "/dashboard";
    } else {
      setError("Failed to sign in after registration");
    }
    setLoading(false);
  };

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    if (res?.ok) {
      window.location.href = "/dashboard";
    } else {
      setError("Invalid email or password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6">
          {isRegistering ? "Create Account" : "Sign In"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* ==== CREDENTIALS FORM ==== */}
        <form onSubmit={isRegistering ? handleRegister : handleCredentialLogin} className="space-y-4">
          {isRegistering && (
            <>
              <input
                type="text"
                placeholder="First Name"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
              <input
                type="text"
                placeholder="Last Name"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {isRegistering && (
            <input
              type="password"
              placeholder="Confirm Password"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : isRegistering ? "Register" : "Sign In"}
          </button>
        </form>

        {/* ==== OAUTH BUTTONS ==== */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <button
              onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
            >
              Facebook
            </button>

            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
            >
              Google
            </button>
          </div>
        </div>

        {/* ==== TOGGLE REGISTER / LOGIN ==== */}
        <p className="mt-6 text-center text-sm">
          {isRegistering ? (
            <>Already have an account? <button onClick={() => { setIsRegistering(false); setError(""); }} className="text-indigo-600 font-medium">Sign In</button></>
          ) : (
            <>Don't have an account? <button onClick={() => { setIsRegistering(true); setError(""); }} className="text-indigo-600 font-medium">Register</button></>
          )}
        </p>
      </div>
    </div>
  );
}