import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, errCode, errMessage } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const me = await login(username, password);
      navigate(me?.is_staff ? "/admin/orders" : "/");
    } catch (err) {
      if (errCode(err) === "email_not_verified") {
        const email = err.response?.data?.email;
        navigate("/verify-email", { state: { email: Array.isArray(email) ? email[0] : email } });
        return;
      }
      setError(
        err.response?.status === 401 || !err.response
          ? "Invalid username or password."
          : errMessage(err, "Invalid username or password.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-dark px-5">
      <div className="max-w-sm w-full text-white text-center">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Buy Rite Renaissance Spirits" className="mx-auto mb-5 h-16 w-auto rounded-lg" />
        <h1 className="font-display text-2xl mb-6">Log In</h1>
        <form onSubmit={submit} className="text-left">
          <label className="text-xs text-[#E8B4A8]">Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg mb-3.5 mt-1 text-ink" />
          <label className="text-xs text-[#E8B4A8]">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg mb-4 mt-1 text-ink" />
          {error && <div className="bg-[#6E0A1B] rounded-lg p-3 text-sm mb-4">{error}</div>}
          <button disabled={loading} className="w-full py-3 rounded-lg bg-orange font-semibold disabled:opacity-60">
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <p className="text-sm text-[#E8B4A8] mt-4">
          <Link to="/forgot-password" className="text-white underline">Forgot password?</Link>
        </p>
        <p className="text-sm text-[#E8B4A8] mt-2">
          New here? <Link to="/signup" className="text-white underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
