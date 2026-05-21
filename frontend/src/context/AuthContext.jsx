import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import api from "../services/api";

const AuthContext = createContext(null);

function readStoredUser() {
  const raw = localStorage.getItem("pv_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("pv_user");
    localStorage.removeItem("pv_token");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("pv_token");
    if (!token) return;
    api.get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("pv_user", JSON.stringify(res.data.user));
      })
      .catch(() => logout());
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("pv_token", res.data.token);
      localStorage.setItem("pv_user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data.user;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", payload);
      localStorage.setItem("pv_token", res.data.token);
      localStorage.setItem("pv_user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("pv_token");
    localStorage.removeItem("pv_user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, signup, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
