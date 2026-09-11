import React, { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    client
      .get("/auth/me/")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      })
      .finally(() => setLoading(false));
  }, []);

  // Store tokens + user from any endpoint that returns {access, refresh, user}.
  const applyAuthResult = (data) => {
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    setUser(data.user);
    return data.user;
  };

  const login = async (username, password) => {
    const { data } = await client.post("/auth/login/", { username, password });
    return applyAuthResult(data);
  };

  // Returns { needsVerification: true, email } — no tokens until the email
  // is verified.
  const register = async (payload) => {
    const { data } = await client.post("/auth/register/", payload);
    return { needsVerification: true, email: data.email };
  };

  const verifyEmail = async (email, code) => {
    const { data } = await client.post("/auth/verify-email/", { email, code });
    return applyAuthResult(data);
  };

  const resendVerification = (email) =>
    client.post("/auth/resend-verification/", { email });

  const requestPasswordReset = (email) =>
    client.post("/auth/password-reset/request/", { email });

  const confirmPasswordReset = async (email, code, new_password) => {
    const { data } = await client.post("/auth/password-reset/confirm/", {
      email,
      code,
      new_password,
    });
    return applyAuthResult(data);
  };

  const updateProfile = async (patch) => {
    const { data } = await client.patch("/auth/profile/", patch);
    setUser(data);
    return data;
  };

  // Credential-change flows: request emails a code, confirm applies it and
  // returns fresh tokens.
  const changePassword = {
    request: (current_password, new_password) =>
      client.post("/auth/change-password/request/", { current_password, new_password }),
    confirm: async (code, new_password) => {
      const { data } = await client.post("/auth/change-password/confirm/", { code, new_password });
      return applyAuthResult(data);
    },
  };
  const changeUsername = {
    request: (new_username, password) =>
      client.post("/auth/change-username/request/", { new_username, password }),
    confirm: async (code) => {
      const { data } = await client.post("/auth/change-username/confirm/", { code });
      return applyAuthResult(data);
    },
  };
  const changeEmail = {
    request: (new_email, password) =>
      client.post("/auth/change-email/request/", { new_email, password }),
    confirm: async (code) => {
      const { data } = await client.post("/auth/change-email/confirm/", { code });
      return applyAuthResult(data);
    },
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyEmail,
        resendVerification,
        requestPasswordReset,
        confirmPasswordReset,
        updateProfile,
        changePassword,
        changeUsername,
        changeEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// Pull a machine code (e.g. "email_not_verified") out of a DRF error body,
// tolerating both string and list shapes.
export function errCode(err) {
  const c = err?.response?.data?.code;
  return Array.isArray(c) ? c[0] : c;
}

// Best-effort human message from a DRF error body.
export function errMessage(err, fallback = "Something went wrong.") {
  const d = err?.response?.data;
  if (!d) return fallback;
  if (typeof d === "string") return d;
  if (d.detail) return Array.isArray(d.detail) ? d.detail[0] : d.detail;
  if (d.code && d.code !== "email_not_verified")
    return Array.isArray(d.code) ? d.code[0] : d.code;
  const first = Object.values(d)[0];
  return Array.isArray(first) ? first[0] : first || fallback;
}
