import { ShieldCheck } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "student@proctorvision.local", password: "Student@123" });

  const submit = async (event) => {
    event.preventDefault();
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-slate-50 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="auth-panel flex items-center justify-center px-8 py-12 text-white">
        <div className="relative z-10 max-w-xl animate-fadeUp">
          <div className="mb-8 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-600 shadow-glow animate-pulseSoft">
            <ShieldCheck size={30} />
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight">ProctorVision AI</h1>
          <p className="mt-5 text-lg text-slate-300">
            Secure online exams with real-time AI face monitoring, browser activity tracking, and admin-ready cheating reports.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Face AI", "Browser Lock", "Live Logs"].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_34%),#f8fafc] px-6 py-12">
        <form onSubmit={submit} className="glass-card w-full max-w-md animate-fadeUp rounded-2xl p-8">
          <h2 className="text-2xl font-bold">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Use the seeded demo accounts or your student account.</p>
          <label className="mt-6 block text-sm font-semibold">Email</label>
          <input className="input-field mt-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <label className="mt-4 block text-sm font-semibold">Password</label>
          <input type="password" className="input-field mt-2" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button disabled={loading} className="btn-primary mt-6 w-full px-4 py-3 disabled:opacity-60">
            {loading ? "Signing in..." : "Login"}
          </button>
          <p className="mt-5 text-center text-sm text-slate-500">
            New student? <Link className="font-semibold text-emerald-700" to="/signup">Create an account</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
