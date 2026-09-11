import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.is_staff) navigate("/admin/orders", { replace: true });
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const me = await login(username, password);
      if (me?.is_staff) {
        navigate("/admin/orders", { replace: true });
      } else {
        setError("This account does not have admin access.");
      }
    } catch (e) {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-dark px-5">
      <div className="max-w-sm w-full text-white text-center">
        <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-orange flex items-center justify-center">
          <ShieldCheck color="#fff" size={28} />
        </div>
        <h1 className="font-display text-2xl mb-2">Admin Login</h1>
        <p className="text-xs text-[#E8B4A8] mb-6">Staff access only.</p>
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
      </div>
    </div>
  );
}
