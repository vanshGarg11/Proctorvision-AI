import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async (event) => {
    event.preventDefault();
    try {
      await signup(form);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_34%),#f8fafc] px-6">
      <form onSubmit={submit} className="glass-card w-full max-w-md animate-fadeUp rounded-2xl p-8">
        <h1 className="text-2xl font-bold">Student signup</h1>
        <label className="mt-6 block text-sm font-semibold">Full name</label>
        <input className="input-field mt-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label className="mt-4 block text-sm font-semibold">Email</label>
        <input className="input-field mt-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label className="mt-4 block text-sm font-semibold">Password</label>
        <input type="password" className="input-field mt-2" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button disabled={loading} className="btn-primary mt-6 w-full px-4 py-3 disabled:opacity-60">
          {loading ? "Creating account..." : "Create account"}
        </button>
        <p className="mt-5 text-center text-sm text-slate-500">
          Already registered? <Link className="font-semibold text-emerald-700" to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
