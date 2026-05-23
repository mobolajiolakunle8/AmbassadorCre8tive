import { useState } from "react";
import { adminLogin } from "../lib/firebase";

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Try Firebase Auth first, fall back to demo credentials
    const result = await adminLogin(email, password);
    if (result.success) {
      onLogin();
      window.location.hash = "#/admin";
    } else {
      // Firebase not configured? Allow demo login
      if (email === "admin@ambassadorcre8tive.com" && password === "admin123") {
        localStorage.setItem("adminLoggedIn", "true");
        onLogin();
        window.location.hash = "#/admin";
      } else {
        setError("Invalid credentials. Check your email and password.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0f12] via-[#2a151b] to-[#1a0f12] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-[#5E0B1D] to-[#7A1128] shadow-2xl shadow-[#5E0B1D]/30 mb-4">
            <span className="text-3xl font-bold text-white">A</span>
          </div>
          <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>
          <p className="text-white/60 mt-1">Ambassador Cre8tive</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-[#5E0B1D] focus:bg-white/10"
                placeholder="admin@ambassadorcre8tive.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-[#5E0B1D] focus:bg-white/10"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#5E0B1D] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#5E0B1D]/25 transition hover:bg-[#4a0917] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-white/40 text-center">
              Demo credentials: admin@ambassadorcre8tive.com / admin123
            </p>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © {new Date().getFullYear()} Ambassador Cre8tive. All rights reserved.
        </p>
      </div>
    </div>
  );
}
